import React, { useState } from 'react';
import axios from 'axios';

const ResetPasswordPopup = () => {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState('');

  // 인증코드 요청 (서버에서 생성하여 이메일 전송)
  const handleSendCode = async () => {
    if (!email) return alert('이메일을 입력하세요.');

    try {
      await axios.post('/user/reset-password/code', { email });
      setCodeSent(true);
      alert('인증번호가 이메일로 전송되었습니다.');
    } catch (err) {
      console.error(err);
      alert('인증번호 전송에 실패했습니다.');
    }
  };

  // 인증번호 검증 요청
  const handleVerifyCode = async () => {
    try {
      const res = await axios.post('/user/reset-password/verify', {
        email,
        code: inputCode,
      });

      if (res.data.success) {
        setVerified(true);
        setStatus('인증 완료');
        alert('이메일 인증이 완료되었습니다.');
      } else {
        alert('인증번호가 틀렸습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('인증 검증에 실패했습니다.');
    }
  };

  // 임시 비밀번호 발급 요청
  const handleResetPassword = async () => {
    try {
      const res = await axios.post('/user/reset-password/reset', { email });
      alert(res.data.message || '임시 비밀번호가 이메일로 전송되었습니다.');
      window.close(); // 팝업 종료
    } catch (err) {
      console.error(err);
      alert('비밀번호 재발급에 실패했습니다.');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>비밀번호 재발급</h2>

      <div>
        <label>이메일 주소:</label>
        <input
          type="email"
          value={email}
          disabled={verified}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
        />
        {!codeSent && (
          <button onClick={handleSendCode}>인증번호 보내기</button>
        )}
      </div>

      {codeSent && !verified && (
        <div style={{ marginTop: 10 }}>
          <label>인증번호 입력:</label>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
          <button onClick={handleVerifyCode} style={{ marginTop: 8 }}>
            인증 확인
          </button>
        </div>
      )}

      {verified && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: 'green' }}>{status}</p>
          <button onClick={handleResetPassword}>임시 비밀번호 발급받기</button>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPopup;
