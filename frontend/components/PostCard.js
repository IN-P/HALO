import React from 'react';

const PostCard = ({ post }) => {
  if (!post) return null;
  return (
    <div style={{
      background: '#fff',
      padding: 20,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      marginBottom: 16
    }}>
      {/* 작성자 */}
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
        {post.User?.nickname || '알 수 없음'}
        {/* 팔로우 버튼 예시 (유저 정보 있을 때만!) */}
        {/* {post.User && <FollowButton toUserId={post.User.id} />} */}
      </div>
      {/* 이미지 (여러장 중 첫번째만 표시 예시) */}
      {post.Images && post.Images.length > 0 && (
        <img
          src={`http://localhost:3065/uploads/post/${post.Images[0].src}`}
          alt="게시글 이미지"
          style={{ width: 300, borderRadius: 8, marginBottom: 8 }}
        />
      )}
      {/* 게시글 내용 */}
      <div>{post.content}</div>
    </div>
  );
};

export default PostCard;
