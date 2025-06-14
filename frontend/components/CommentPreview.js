import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { LOAD_COMMENTS_REQUEST } from "../reducers/comment_IN";

const CommentPreview = ({ postId, onShowDetailModal }) => {
  const dispatch = useDispatch();
  const { comments, loadCommentsDone } = useSelector(state => state.comment_IN);

  useEffect(() => {
    if (!loadCommentsDone?.[postId]) dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
  }, [dispatch, postId, loadCommentsDone]);

  const effectiveComments = comments[postId] && loadCommentsDone?.[postId] ? comments[postId] : [];
  const flatten = arr => arr.reduce((acc, c) => acc.concat(c, c.replies || []), []);
  const allComments = flatten(effectiveComments);
  // 최신순(위에!)  
  const sorted = [...allComments].sort((a, b) => b.id - a.id); // 최신이 위로  
  const previewComments = sorted.slice(0, 3);

  return (
    <div
      style={{
        margin: '8px 0 0 0',
        background: '#fafbfc',
        borderRadius: 10,
        minHeight: 40,
        padding: '10px 14px 8px 14px',
        border: '1px solid #f2f2f2',
        fontSize: 15,
        color: '#333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        cursor: onShowDetailModal ? "pointer" : "default",
      }}
      onClick={onShowDetailModal}
    >
      {previewComments.length === 0 && (
        <div style={{ color: '#b0b0b0', margin: '6px 2px', fontStyle: 'italic', fontSize: 15 }}>
          아직 댓글이 없습니다 🙃
        </div>
      )}
      {previewComments.map((c) =>
        c && c.User ? (
          <div
            key={c.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "12px 0 0 0",
              borderBottom: "1px solid #f1f1f1",
              background: "none",
            }}
          >
            <img
              src={c.User?.profile_img ? `http://localhost:3065${c.User.profile_img}` : "http://localhost:3065/img/profile/default.jpg"}
              alt="avatar"
              style={{
                width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", flexShrink: 0, cursor: "pointer",
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                {c.User?.nickname || "알 수 없음"}
              </span>
              <div style={{
                whiteSpace: "pre-wrap", fontSize: 15, color: c.is_deleted ? "#721c24" : "#222",
              }}>
                {c.is_deleted ? "삭제된 댓글입니다." : c.content}
              </div>
            </div>
          </div>
        ) : null
      )}
      {allComments.length > 3 && (
        <div
          style={{
            color: "#2995f4", fontSize: 15, fontWeight: 500, marginTop: 3, userSelect: "none",
          }}
        >
          댓글 더보기
        </div>
      )}
    </div>
  );
};

export default CommentPreview;
