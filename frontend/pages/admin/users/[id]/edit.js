// frontend/pages/admin/users/[id]/edit.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  message,
} from 'antd';
import {
  UserOutlined,
  RollbackOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { getRoleName, UserRoleNames } from '../../../../utils/roleNames';
import { useSpring, animated } from '@react-spring/web';

const { Title } = Typography;
const { Option } = Select;

const EditUserPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useSelector((state) => state.user_YG);
  const [formInstance] = Form.useForm();
  const [initialData, setInitialData] = useState(null);

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 },
    delay: 150,
  });

  useEffect(() => {
    if (!user || (user.role !== 1 && user.role !== 5)) {
      message.warning('접근 권한이 없습니다.');
      router.push('/');
    }
  }, [user]);

  useEffect(() => {
    if (id && user) {
      axios.get(`/api/admin/users/${id}`)
        .then((res) => {
          setInitialData(res.data);
          formInstance.setFieldsValue({
            nickname: res.data.nickname,
            phone: res.data.UserInfo?.phone || '',
            introduce: res.data.UserInfo?.introduce || '',
            role: res.data.role,
          });
        })
        .catch((err) => {
          console.error('유저 정보 조회 실패:', err);
          message.error('정보 조회 실패');
        });
    }
  }, [id, user, formInstance]);

  const handleSubmit = async (values) => {
    try {
      await axios.patch(`/api/admin/users/${id}`, values, { withCredentials: true });
      message.success('수정 완료');
      router.push(`/admin/users/${id}`);
    } catch (err) {
      console.error('수정 실패:', err);
      message.error('수정 실패');
    }
  };

  if (!initialData) return <div style={{ padding: 40 }}>로딩 중...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <animated.div style={fadeIn}>
        <Card
          bordered
          style={{ maxWidth: 700, margin: '0 auto', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
          title={<Title level={3} style={{ margin: 0 }}><UserOutlined /> 유저 정보 수정</Title>}
        >
          <Form
            form={formInstance}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item label="이메일 (변경 불가)">
              <Input value={initialData.email} disabled />
            </Form.Item>

            <Form.Item
              label="닉네임"
              name="nickname"
              rules={[{ required: true, message: '닉네임을 입력해주세요.' }]}
            >
              <Input placeholder="닉네임 입력" allowClear />
            </Form.Item>

            <Form.Item label="연락처" name="phone">
              <Input placeholder="연락처 입력" allowClear />
            </Form.Item>

            <Form.Item label="소개글" name="introduce">
              <Input.TextArea rows={3} placeholder="소개글 입력" allowClear />
            </Form.Item>

            <Form.Item label="권한" name="role">
              {user.role === 1 ? (
                <Select>
                  {Object.entries(UserRoleNames).map(([key, label]) => (
                    <Option key={key} value={parseInt(key, 10)}>
                      {label}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Input value={getRoleName(initialData.role)} disabled />
              )}
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Button icon={<RollbackOutlined />} onClick={() => router.back()} style={{ marginRight: 10 }}>
                취소
              </Button>
              <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                수정 완료
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </animated.div>
    </div>
  );
};

export default EditUserPage;
