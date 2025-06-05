// pages/inquiry.jsx

import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import AppLayout from '../components/AppLayout';
import { useSelector } from 'react-redux';// 로그인 사용자 정보 가져오기
import axios from 'axios';

const { TextArea } = Input;


const InquiryForm = () => {
  const userState = useSelector((state) => state.user_YG || {});
  const me = userState.user;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async() => {
    if (!title || !content) {
      message.warning('제목과 문의 내용을 모두 입력해주세요.');
      return;
    }

    try{
      await axios.post('http://localhost:3065/inquiry',{
        title,
        message:content,
      }, { withCredentials: true });
      message.success('문의가 접수되었습니다.');
      setTitle('');
      setContent('');
    }catch(error){
      console.error('문의 전송 실패:', error);
      message.error('문의 전송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h2>문의하기</h2>
      {/* 로그인 사용자 정보 표시 */}
      <div style={{ marginBottom: 24 }}>
        <strong>문의자:</strong>{' '}
        {me ? `${me.nickname}(${me.email})` : '로그인 정보없음'}
      </div>

      {/* 제목 입력 */}
      <Input
        placeholder="제목을 입력해주세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      {/* 내용 입력 */}
      <TextArea
        rows={6}
        placeholder="문의 내용을 입력해주세요"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handleSubmit}>문의 보내기</Button>
    </div>
  );
};

// 여기서 AppLayout으로 감싸서 export!
const InquiryPage = () => (
  <AppLayout>
    <InquiryForm />
  </AppLayout>
);

export default InquiryPage;
