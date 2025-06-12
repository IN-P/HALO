// pages/admin/roulette-rewards.js
import React, { useEffect, useState } from 'react';
import { Button, Input, message, Form, Space } from 'antd';
import axios from 'axios';
import AppLayout from '../../../components/AppLayout';
import RouletteSidebar from '../../../components/EventAdminSidebar';

const AdminRouletteRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/roulette/rewards', { withCredentials: true });
      setRewards(res.data);
    } catch (err) {
      message.error('보상 목록 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, []);

  const handleUpdate = async () => {
    const newRewards = inputValue
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);

    if (newRewards.length === 0) {
      message.warning('숫자로 된 보상 값을 입력하세요.');
      return;
    }

    try {
      await axios.put(
        '/api/roulette/rewards',
        { newRewards },
        { withCredentials: true }
      );
      message.success('보상 수정 완료');
      setInputValue('');
      loadRewards();
    } catch (err) {
      message.error('보상 수정 실패');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* 🎯 사이드바 */}
      <div style={{ width: 220 }}>
        <RouletteSidebar />
      </div>

      {/* 🎯 본문 AppLayout */}
      <div style={{ flex: 1 }}>
        <AppLayout>
          <div style={{ padding: '40px 20px' }}>
            <h2>🎯 룰렛 보상 설정</h2>
            <p>현재 보상: <strong>{rewards.join(', ') || '없음'}</strong></p>

            <Form onFinish={handleUpdate}>
              <Form.Item label="새 보상 목록 (쉼표 구분)">
                <Input
                  placeholder="예: 10, 20, 50, 100"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    수정
                  </Button>
                  <Button onClick={loadRewards}>새로고침</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </AppLayout>
      </div>
    </div>
  );
};

export default AdminRouletteRewards;
