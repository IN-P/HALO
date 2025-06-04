import React from 'react';
import FollowButton from './FollowButton'; 

const PostCard = ({ title, content, toUserId }) => {
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: 16
    }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <FollowButton toUserId={toUserId} />
      <p>{content}</p>
    </div>
  );
};

export default PostCard;
