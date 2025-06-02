import React from 'react';
import FollowButton from './FollowButton'; 
const PostCard = ({ title, content }) => {
  const toUserId = 2; // 게시글 작성자 (임시)
  const fromUserId = 1; // 로그인한 유저 (임시)
  const isFollowing = false; // 처음엔 팔로우 안한 상태로 가정
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: 16
    }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <FollowButton
        toUserId={toUserId}
        fromUserId={fromUserId}
        initialIsFollowing={isFollowing}
      />
      <p>{content}</p>
    </div>
  );
};

export default PostCard;
