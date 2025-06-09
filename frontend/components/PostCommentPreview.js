import React from 'react';
import { useSelector } from 'react-redux';

function PostCommentPreview({ postId, onShowDetailModal }) {
  // 항상 리덕스에서 최신 댓글 불러옴
  const comments = useSelector(state => state.comment_IN.comments[postId] || []);
  const commentCount = comments.length;
  const previewComments = comments.slice(0, 2);
  const showMoreComments = commentCount > 2;

  return (
    <div style={{
      margin: '8px 0 0 0',
      background: '#fafbfc',
      borderRadius: 10,
      minHeight: 40,
      padding: '10px 14px 8px 14px',
      border: '1px solid #f2f2f2',
      fontSize: 15,
      color: '#333',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    }}>
      {commentCount === 0 && (
        <div style={{ color: '#b0b0b0', margin: '6px 2px', fontStyle: 'italic', fontSize: 15 }}>
          아직 댓글이 없습니다 🙃
        </div>
      )}
      {previewComments.map((c, idx) =>
        c && c.User ? (
          <div key={c.id} style={{
            marginBottom: 4,
            padding: '2px 0 2px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 7,
            fontSize: 15,
            lineHeight: 1.6,
            borderRadius: 8,
            background: idx % 2 === 0 ? '#fff' : '#f4f9ff',
            boxShadow: '0 0.5px 1.5px rgba(100,140,210,0.04)',
            wordBreak: 'break-word'
          }}>
            <b style={{ marginRight: 7, color: '#1976d2', minWidth: 62 }}>{c.User.nickname}</b>
            <span style={{
              color: '#222',
              flex: 1,
              whiteSpace: 'pre-line',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {c.content.length > 120 ? c.content.slice(0, 120) + '...' : c.content}
            </span>
          </div>
        ) : null
      )}
      {showMoreComments && (
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#2995f4',
            padding: 0,
            cursor: 'pointer',
            fontSize: 15,
            margin: '4px 0 2px 0',
            fontWeight: 500,
            display: 'block',
            textAlign: 'left'
          }}
          onClick={onShowDetailModal}
        >
          댓글 {commentCount}개 모두 보기
        </button>
      )}
    </div>
  );
}

export default PostCommentPreview;
