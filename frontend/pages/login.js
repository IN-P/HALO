// frontend/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import CatLottie from '../components/CatLottie';
import { LOG_IN_REQUEST } from '../reducers/user_YG';
import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Divider,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  SmileOutlined,
  KeyOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { useSpring, animated } from '@react-spring/web';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const router = useRouter();
  const { error } = router.query;

  useEffect(() => {
    if (error === 'oauth') {
      alert('간편 로그인에 실패했습니다. 계정 상태를 확인하세요.');
    }
  }, [error]);
  
  const dispatch = useDispatch();
  const { logInLoading, logInError, logInDone, isLogin } = useSelector((state) => state.user_YG);

  const [form] = Form.useForm();

  useEffect(() => {
    if (isLogin) router.replace('/');
  }, [isLogin]);

  useEffect(() => {
    if (logInDone) {
      message.success('로그인 성공!');
      router.push('/');
    }
  }, [logInDone]);

  useEffect(() => {
    if (logInError) message.error(logInError);
  }, [logInError]);

  const handleLogin = (values) => {
    const { email, password } = values;
    dispatch({
      type: LOG_IN_REQUEST,
      data: { email, password },
    });
  };

  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 200, friction: 20 },
    delay: 100,
  });

  return (
    <Row
      justify="end"
      align="middle"
      style={{
        height: '100vh',
        backgroundImage: "url('http://localhost:3065/img/view/login.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 좌측 상단 Welcome + Halo 로고 */}
      <div style={{ position: 'absolute', top: 40, left: 60, color: 'white' }}>
        <Title level={1} style={{ color: 'white', marginBottom: 0 }}>Welcome</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <img src="/images/HALOlogo.png" alt="Halo 로고" style={{ width: 40, height: 40 }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>Halo</Title>
        </div>
      </div>

      <Col xs={22} sm={20} md={14} lg={10} xl={8} style={{ marginRight: 60 }}>
        <animated.div style={fadeIn}>
          <Card
            bordered={false}
            style={{ borderRadius: 20, boxShadow: '0 15px 40px rgba(0,0,0,0.25)', padding: '30px 24px' }}
          >
<Space direction="vertical" style={{ width: '100%' }} align="center">
  <CatLottie width={180} height={180} />
</Space>

            <Form
              form={form}
              name="loginForm"
              layout="vertical"
              onFinish={handleLogin}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="email"
                label="이메일"
                tooltip="가입 시 등록한 이메일을 입력해주세요."
                rules={[{ required: true, message: '이메일을 입력해주세요.' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter your email" allowClear />
              </Form.Item>

              <Form.Item
                name="password"
                label="비밀번호"
                tooltip={{ title: '비밀번호는 최소 6자 이상입니다.', icon: <InfoCircleOutlined /> }}
                rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  allowClear
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={logInLoading}
                  icon={<ArrowRightOutlined />}
                >
                  로그인
                </Button>
              </Form.Item>
            </Form>

            <Divider plain>또는</Divider>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<GoogleOutlined />}
                block
                size="large"
                style={{ backgroundColor: '#DB4437', color: '#fff', border: 'none' }}
                onClick={() => window.location.href = 'http://localhost:3065/auth/google'}
              >
                Google로 로그인
              </Button>

              <Button
                icon={<SmileOutlined />}
                block
                size="large"
                style={{ backgroundColor: '#FEE500', color: '#3c1e1e', border: 'none' }}
                onClick={() => window.location.href = 'http://localhost:3065/auth/kakao'}
              >
                Kakao로 로그인
              </Button>
            </Space>

            <Divider />

            <div style={{ marginTop: 12, lineHeight: '1.8' }}>
              <Paragraph>
                계정이 없으신가요?{' '}
                <Button type="link" onClick={() => router.push('/signup')}>
                  회원가입
                </Button>
              </Paragraph>
              <Paragraph>
                계정이 잠겼거나 삭제되었나요?{' '}
                <Button type="link" onClick={() => window.open('/recovery-popup', '계정 복구', 'width=500,height=600')}>
                  계정 복구
                </Button>
              </Paragraph>
              <Paragraph>
                비밀번호를 잊으셨나요?{' '}
                <Button type="link" onClick={() => window.open('/reset-password-popup', '비밀번호 재발급', 'width=500,height=600')}>
                  비밀번호 재발급
                </Button>
              </Paragraph>
            </div>
          </Card>
        </animated.div>
      </Col>
    </Row>
  );
};

export default LoginPage;