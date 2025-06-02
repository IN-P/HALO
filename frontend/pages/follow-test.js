// frontend/pages/follow-test.js
import React from 'react';
import FollowList from '../components/FollowList';

const FollowTestPage = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>팔로잉 목록 테스트</h2>
      <FollowList userId={1} type="followings" />

      <h2>팔로워 목록 테스트</h2>
      <FollowList userId={2} type="followers" />
    </div>
  );
};

export default FollowTestPage;
