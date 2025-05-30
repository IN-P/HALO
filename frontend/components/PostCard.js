import React from 'react';

const PostCard = ({ title, content }) => {
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: 16
    }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p>{content}</p>
    </div>
  );
};

export default PostCard;
