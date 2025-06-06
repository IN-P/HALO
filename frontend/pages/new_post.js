import React from 'react';
import AppLayout from '../components/AppLayout';
import PostForm from '../components/PostForm';
import useRequireLogin from '../hooks/useRequireLogin'; //훅연결 윤기

const NewPostPage = () => {
  useRequireLogin(); // 로그아웃 훅
  return(
  <AppLayout>
    <PostForm />
  </AppLayout>
)};

export default NewPostPage;