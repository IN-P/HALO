// frontend/pages/admin/users/[id].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Card,
  Typography,
  Avatar,
  Button,
  Space,
  Descriptions,
  message,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { getRoleName } from '../../../utils/roleNames';
import { useSpring, animated } from '@react-spring/web';

const { Title } = Typography;

const UserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useSelector((state) => state.user_YG);
  const [userInfo, setUserInfo] = useState(null);

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
    if (id && user && (user.role === 1 || user.role === 5)) {
      axios
        .get(`/api/admin/users/${id}`)
        .then((res) => setUserInfo(res.data))
        .catch((err) => {
          console.error('유저 정보 로드 실패:', err);
          message.error('유저 정보를 불러오는 데 실패했습니다.');
        });
    }
  }, [id, user]);

  if (!userInfo) return <div style={{ padding: 40 }}>로딩 중...</div>;

  const {
    email,
    nickname,
    createdAt,
    role,
    ip,
    profile_img,
    UserInfo,
    Social,
  } = userInfo;

  const profileSrc = profile_img
    ? `http://localhost:3065${profile_img}`
    : '/img/profile/default.jpg';

  return (
    <div style={{ padding: '40px' }}>
      <animated.div style={fadeIn}>
        <Card
          title={<Title level={3} style={{ margin: 0 }}><UserOutlined /> 유저 상세 정보</Title>}
          bordered
          style={{ maxWidth: 800, margin: '0 auto', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
        >
          <Space align="start" style={{ display: 'flex' }}>
            <Avatar
              size={120}
              src={profileSrc}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#ccc', border: '2px solid #ddd' }}
            />

            <Descriptions
              column={1}
              bordered
              size="middle"
              style={{ marginLeft: 30, flex: 1 }}
            >
              <Descriptions.Item label="ID">{id}</Descriptions.Item>
              <Descriptions.Item label="이메일">{email}</Descriptions.Item>
              <Descriptions.Item label="닉네임">{nickname}</Descriptions.Item>
              <Descriptions.Item label="역할">{getRoleName(role)}</Descriptions.Item>
              <Descriptions.Item label="가입일">{createdAt?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="IP">{ip || '-'}</Descriptions.Item>
              <Descriptions.Item label="소셜 로그인">{Social?.code || '일반회원'}</Descriptions.Item>
              <Descriptions.Item label="연락처">{UserInfo?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="소개글">{UserInfo?.introduce || '-'}</Descriptions.Item>
            </Descriptions>
          </Space>

          <div style={{ marginTop: 30, textAlign: 'right' }}>
            <Button
              icon={<RollbackOutlined />}
              onClick={() => router.push('/admin/users')}
              style={{ marginRight: 10 }}
            >
              목록으로
            </Button>
            {(user.role === 1 || user.role === 5) && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => router.push(`/admin/users/${id}/edit`)}
              >
                수정
              </Button>
            )}
          </div>
        </Card>
      </animated.div>
    </div>
  );
};

export default UserDetailPage;
