import React, { useState } from 'react';
import axios from 'axios';
import {
  Form,
  Input,
  Button,
  Typography,
  Card,
  Divider,
  message,
} from 'antd';
import {
  MailOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  LockOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ResetPasswordPopup = () => {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSendCode = async () => {
    if (!email) return message.warning('이메일을 입력하세요.');
    try {
      await axios.post('/user/reset-password/code', { email });
      setCodeSent(true);
      setMsg('📩 인증번호가 이메일로 전송되었습니다.');
      message.success('📩 인증번호가 이메일로 전송되었습니다.');
    } catch (err) {
      console.error(err);
      message.error('인증번호 전송에 실패했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await axios.post('/user/reset-password/verify', {
        email,
        code: inputCode,
      });

      if (res.data.success) {
        setVerified(true);
        setMsg('✅ 이메일 인증이 완료되었습니다.');
        message.success('✅ 이메일 인증이 완료되었습니다.');
      } else {
        message.error('인증번호가 틀렸습니다.');
      }
    } catch (err) {
      console.error(err);
      message.error('인증 검증에 실패했습니다.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post('/user/reset-password/reset', { email });
      message.success(res.data.message || '임시 비밀번호가 이메일로 전송되었습니다.');
      setTimeout(() => window.close(), 1000);
    } catch (err) {
      console.error(err);
      message.error('비밀번호 재발급에 실패했습니다.');
    }
  };

  return (
    <div style={popupWrapperStyle}>
      <Card
        title={<Title level={3} style={{ marginBottom: 0 }}>🔐 비밀번호 재발급</Title>}
        style={{ maxWidth: 480, width: '100%', borderRadius: 12 }}
      >
        <Form layout="vertical">
          <Form.Item
            label="이메일 주소"
            tooltip="가입 시 사용한 이메일을 입력하세요"
            required
          >
            <Input
              prefix={<MailOutlined />}
              type="email"
              value={email}
              disabled={verified}
              placeholder="example@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          {!codeSent && !verified && (
            <Form.Item>
              <Button
                type="primary"
                block
                icon={<SafetyCertificateOutlined />}
                onClick={handleSendCode}
              >
                인증번호 보내기
              </Button>
            </Form.Item>
          )}

          {codeSent && !verified && (
            <>
              <Divider />
              <Form.Item label="인증번호 입력">
                <Input
                  value={inputCode}
                  placeholder="인증번호 6자리"
                  onChange={(e) => setInputCode(e.target.value)}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  block
                  icon={<SafetyCertificateOutlined />}
                  onClick={handleVerifyCode}
                >
                  인증 확인
                </Button>
              </Form.Item>
            </>
          )}

          {msg && (
            <Form.Item>
              <Text type={verified ? 'success' : 'secondary'}>{msg}</Text>
            </Form.Item>
          )}

          {verified && (
            <Form.Item style={{ marginTop: 20 }}>
              <Button
                type="dashed"
                block
                icon={<ReloadOutlined />}
                onClick={handleResetPassword}
              >
                임시 비밀번호 발급받기
              </Button>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

// 공통 배경 스타일
const popupWrapperStyle = {
  minHeight: '100vh',
  background: 'rgba(0,0,0,0.3)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
};

export default ResetPasswordPopup;
