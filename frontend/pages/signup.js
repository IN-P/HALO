// frontend/pages/signup.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { SIGN_UP_REQUEST, SIGN_UP_RESET } from '../reducers/user_YG';
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
  Checkbox
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SmileOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { useSpring, animated } from '@react-spring/web';

const { Title, Text, Paragraph } = Typography;

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError } = useSelector((state) => state.user_YG);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch({ type: SIGN_UP_RESET });
  }, [dispatch]);

  useEffect(() => {
    if (signUpDone) {
      message.success('회원가입 성공!');
      dispatch({ type: SIGN_UP_RESET });
      router.push('/login');
    }
  }, [signUpDone]);

  useEffect(() => {
    if (signUpError) {
      message.error(signUpError);
    }
  }, [signUpError]);

  const handleSignup = (values) => {
    const { email, nickname, password, confirm, agree } = values;
    if (!agree) return message.warning('약관에 동의해주세요.');
    if (password !== confirm) return message.warning('비밀번호가 일치하지 않습니다.');

    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, nickname, password },
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
        backgroundImage: "url('http://localhost:3065/img/view/signup.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ position: 'absolute', top: 40, left: 60, color: 'white' }}>
        <Title level={1} style={{ color: 'white', marginBottom: 0 }}>Join Us</Title>
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
              <Title level={2} style={{ textAlign: 'center' }}>
                <SmileOutlined style={{ marginRight: 8 }} /> Create your <span style={{ color: '#1890ff' }}>Halo</span> Account
              </Title>
              <img src="/images/HALOlogo.png" alt="Halo Logo" width={64} style={{ marginBottom: 10, borderRadius: '50%' }} />
            </Space>

            <Form
              form={form}
              name="signupForm"
              layout="vertical"
              onFinish={handleSignup}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="nickname"
                label="닉네임"
                rules={[{ required: true, message: '닉네임을 입력해주세요.' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="닉네임" allowClear />
              </Form.Item>

              <Form.Item
                name="email"
                label="이메일"
                tooltip="올바른 이메일 형식을 입력해주세요."
                rules={[{ required: true, type: 'email', message: '이메일을 입력해주세요.' }]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter your email" allowClear />
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

              <Form.Item
                name="confirm"
                label="비밀번호 확인"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: '비밀번호를 다시 입력해주세요.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm your password"
                  allowClear
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item name="agree" valuePropName="checked" style={{ textAlign: 'left' }}>
                <Checkbox>약관에 동의합니다.</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={signUpLoading}
                  icon={<UserAddOutlined />}
                >
                  회원가입
                </Button>
              </Form.Item>
            </Form>

            <Divider />
            <Paragraph style={{ textAlign: 'center' }}>
              이미 계정이 있으신가요?{' '}
              <Button type="link" onClick={() => router.push('/login')}>
                로그인
              </Button>
            </Paragraph>
          </Card>
        </animated.div>
      </Col>
    </Row>
  );
};

export default SignupPage;