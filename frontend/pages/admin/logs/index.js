import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Table, Typography, Tag, message,
  Select, Button, Space, Card
} from 'antd';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const { Title } = Typography;
const { Option } = Select;
const roleMap = {
  0: '일반회원',
  1: '마스터',
  2: '광고관리자',
  3: '신고관리자',
  4: '문의관리자',
  5: '유저관리자',
  6: '보안관리자',
  7: '커스텀관리자',
  8: '업적관리자',
  9: '채팅관리자',
  10: '포스트관리자',
  11: '분석관리자',
  12: '이벤트관리자',
};

const AdminLogsChart = dynamic(() => import('../../../components/AdminLogsChart'), { ssr: false });

const AdminLogsPage = () => {
  const { user } = useSelector((state) => state.user_YG);
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 1 && user.role !== 6) {
      message.warning('접근 권한이 없습니다.');
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/admin/logs');
        setLogs(res.data);
      } catch (err) {
        console.error('로그 조회 실패:', err);
        message.error('로그 조회 중 오류 발생');
      }
    };
    if (user && (user.role === 1 || user.role === 6)) {
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    let result = [...logs];
    if (selectedAction) {
      result = result.filter((log) => log.action === selectedAction);
    }
    result.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortDesc ? bTime - aTime : aTime - bTime;
    });
    setFilteredLogs(result);
  }, [logs, selectedAction, sortDesc]);

  const actionOptions = [...new Set(logs.map(log => log.action))];

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '액션',
      dataIndex: 'action',
      render: (text) => <Tag color="geekblue" style={{ fontWeight: 500 }}>{text}</Tag>,
    },
   {
  title: '실행자',
  dataIndex: 'user',
  render: (_, record) => (
    <span>
      {record.user?.nickname} ({record.user?.email}){' '}
      <Tag color="purple">권한: {roleMap[record.user?.role] || '-'}</Tag>
    </span>
  ),
},
{
  title: '대상',
  dataIndex: 'targetUser',
  render: (_, record) =>
    record.targetUser ? (
      <span>
        {record.targetUser.nickname} ({record.targetUser.email}){' '}
        <Tag color="volcano">권한: {roleMap[record.targetUser?.role] || '-'}</Tag>
      </span>
    ) : (
      <span style={{ color: '#aaa' }}>-</span>
    ),
},


    {
      title: '설명',
      dataIndex: 'description',
      render: (text) => <span style={{ fontStyle: 'italic' }}>{text}</span>,
    },
    {
      title: '시간',
      dataIndex: 'createdAt',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      width: 180,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ padding: '2rem' }}
    >
      <Title level={3} style={{ marginBottom: '2rem' }}>🔍 관리자 로그 기록</Title>

      <Card
        style={{
          marginBottom: '2rem',
          borderRadius: '12px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
        }}
        bodyStyle={{ padding: '1.5rem' }}
      >
        <Title level={4} style={{ textAlign: 'center', marginBottom: '1rem' }}>📊 로그 통계 차트</Title>
        <AdminLogsChart logs={filteredLogs} />
      </Card>

      <Space wrap size="middle" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
        <Select
          placeholder="액션 필터 선택"
          allowClear
          onChange={(value) => setSelectedAction(value)}
          style={{ width: 200 }}
        >
          {actionOptions.map((action) => (
            <Option key={action} value={action}>{action}</Option>
          ))}
        </Select>

        <Button type="primary" onClick={() => setSortDesc(!sortDesc)}>
          {sortDesc ? '🕒 최신순 ↓' : '⏳ 오래된순 ↑'}
        </Button>
      </Space>

      <Table
        dataSource={filteredLogs}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        bordered
        scroll={{ x: 'max-content' }}
        rowClassName={() => 'hover-row'}
      />
    </motion.div>
  );
};

export default AdminLogsPage;
