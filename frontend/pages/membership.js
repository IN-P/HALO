// 상단 import 동일
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Row, Col, Card, Typography, Button, message, Tag, Spin
} from 'antd';
import {
  StarOutlined, CrownOutlined, ThunderboltOutlined, SmileOutlined, GiftOutlined
} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';
import { LOAD_MY_INFO_REQUEST } from '../reducers/user_YG';
import { useSpring, animated } from '@react-spring/web';

const { Title, Text } = Typography;

const getMembershipLevel = (name) => {
  if (name === '기본') return 0;
  if (name === 'silver') return 1;
  if (name === 'gold') return 2;
  if (name === 'vvip') return 3;
  return -1;
};

const theme = {
  기본: { color: '#aaa', bg: '#f9f9f9', icon: <SmileOutlined /> },
  silver: { color: '#a0a0a0', bg: '#eee', icon: <StarOutlined /> },
  gold: { color: '#D4AF37', bg: '#fffbe6', icon: <CrownOutlined /> },
  vvip: { color: '#ff4d4f', bg: '#fff0f6', icon: <ThunderboltOutlined /> },
};

// ✅ 분리된 카드 컴포넌트
const MembershipCard = ({ m, user, index, onBuy }) => {
  const spring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: index * 150,
  });

  const currentLevel = getMembershipLevel(user?.Membership?.name);
  const isCurrent = user?.membership_id === m.id;
  const canBuy = user?.balance >= m.price;
  const targetLevel = getMembershipLevel(m.name);
  const { color, bg, icon } = theme[m.name] || {};

  let showBuyButton = false;
  if (!['기본', 'silver'].includes(m.name) && currentLevel < targetLevel) {
    showBuyButton = true;
  }

  return (
    <Col key={m.id} xs={24} sm={12} md={8} lg={6}>
      <animated.div style={spring}>
        <Card
          title={<span style={{ color, fontWeight: 'bold' }}>{icon} {m.name.toUpperCase()}</span>}
          bordered
          hoverable
          style={{
            borderColor: isCurrent ? '#1890ff' : '#d9d9d9',
            backgroundColor: isCurrent ? '#e6f7ff' : bg || '#fff',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ marginBottom: 10 }}>
            {m.name === '기본' && '무료 사용자. 광고 있음 😅'}
            {m.name === 'silver' && '응원팀 테마 제공 + 약간의 간지 😎'}
            {m.name === 'gold' && '글 상단 고정 + 간지 200% ✨'}
            {m.name === 'vvip' && '모든 혜택 + 당신은 부자 💎'}
          </div>

          <div style={{ marginBottom: 10 }}>
            <span role="img" aria-label="money">💰</span> {m.price.toLocaleString()} 원
          </div>

          {isCurrent ? (
            <Tag color="green">현재 보유 중</Tag>
          ) : showBuyButton ? (
            <Button
              type="primary"
              danger={m.name === 'vvip'}
              ghost={m.name === 'gold'}
              style={{ marginBottom: 12 }}
              disabled={!canBuy}
              onClick={() => onBuy(m.id)}
            >
              {canBuy ? '구매하기' : '잔액 부족'}
            </Button>
          ) : (
            <Button disabled style={{ marginBottom: 12 }}>구매 불가</Button>
          )}

          <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
            {m.name === 'vvip' && <span><GiftOutlined /> VIP 전용 뱃지 지급</span>}
            {m.name === 'gold' && <span>✨ 프사 강조 + 포스트 노출 UP</span>}
            {m.name === 'silver' && <span>⚙️ 응원 테마 활성화</span>}
            {m.name === '기본' && <span>🌀 광고 후원 받고 쓰는 중</span>}
          </div>
        </Card>
      </animated.div>
    </Col>
  );
};

const MembershipPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLogin, user } = useSelector((state) => state.user_YG);

  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) {
      message.warning('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  }, [isLogin]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await axios.get('http://localhost:3065/membership/list', {
          withCredentials: true,
        });
        setMemberships(res.data.memberships);
      } catch (err) {
        console.error('멤버십 불러오기 실패', err);
        message.error('멤버십 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (isLogin) fetchMemberships();
  }, [isLogin]);

  const handleBuy = async (membershipId) => {
    try {
      const res = await axios.post(
        'http://localhost:3065/membership/purchase',
        { userId: user.id, membershipId },
        { withCredentials: true }
      );
      message.success(res.data.message || '멤버십 구매 완료!');
      dispatch({ type: LOAD_MY_INFO_REQUEST });
    } catch (err) {
      console.error('구매 실패:', err);
      const msg = err.response?.data?.message || '구매 실패';
      message.error(msg);
    }
  };

  return (
    <AppLayout>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>✨ 프리미엄 멤버십 센터</Title>
        <Text type="secondary">좋아하는 팀을 더 멋지게 응원하세요!</Text>
        <br />
        <Text strong>현재 잔액:</Text> {user?.balance?.toLocaleString()} 원 &nbsp;&nbsp;
        <Text strong>현재 등급:</Text> {user?.Membership?.name || '기본'}
      </div>

      {loading ? (
        <Spin tip="로딩 중..." />
      ) : (
        <Row gutter={[24, 24]} justify="center">
          {memberships.map((m, index) => (
            <MembershipCard
              key={m.id}
              m={m}
              user={user}
              index={index}
              onBuy={handleBuy}
            />
          ))}
        </Row>
      )}
    </AppLayout>
  );
};

export default MembershipPage;
