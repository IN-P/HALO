import React from 'react';
import FollowList from '../components/FollowList';
import { Card } from 'antd';

const FollowerPage = () => {
  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '50px auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
        }}
      >
        👥 내 팔로워 목록
      </h2>
      <Card
        style={{
          borderRadius: '12px',
          padding: '16px',
          background: '#f9f9f9',
        }}
        bodyStyle={{ padding: 0 }}
      >
        <FollowList type="followers" />
      </Card>
    </div>
  );
};

export default FollowerPage;
