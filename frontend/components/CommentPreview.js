import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { LOAD_COMMENTS_REQUEST } from "../reducers/comment_IN";

const CommentPreview = ({ postId, onShowDetailModal }) => {
  const dispatch = useDispatch();
  const { comments, loadCommentsDone } = useSelector(state => state.comment_IN);
  const mentionUserMap = useSelector(state => state.mentionUser_JW?.mentionUserMap || {});

  useEffect(() => {
    if (!loadCommentsDone?.[postId]) {
      dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
    }
  }, [dispatch, postId, loadCommentsDone]);

  const flatten = arr => arr.reduce((acc, c) => acc.concat(c, c.replies || []), []);
  const effectiveComments = comments[postId] && loadCommentsDone?.[postId] ? comments[postId] : [];
  const allComments = flatten(effectiveComments);
  const sorted = [...allComments].sort((a, b) => b.id - a.id);
  const previewComments = sorted.slice(0, 3);

  const renderContent = (content, mentions = []) => {
    if (!content) return null;
    const userMap = {};
    mentions.forEach(m => {
      userMap[m.nickname?.toLowerCase()] = m.user_id;
    });

    return content.split(/(#[^\s#]+|@[^\s@]+)/g).filter(Boolean).map((part, i) => {
      if (part.startsWith("#")) {
        return <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: "#007bff", textDecoration: "none" }}>{part}</a>;
      }
      if (part.startsWith("@")) {
        const nickname = part.slice(1).toLowerCase();
        const userId = userMap[nickname] || mentionUserMap[nickname];
        return userId ? (
          <a key={i} href={`/profile/${userId}`} style={{ color: "#28a745", textDecoration: "none" }}>{part}</a>
        ) : (
          <span key={i} style={{ color: "#28a745" }}>{part}</span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

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
                width: 28,
                height: 28,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #eee",
                flexShrink: 0,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profile/${c.User?.id}`;
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 'bold', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/profile/${c.User?.id}`;
                }}
              >
                {c.User?.nickname || "알 수 없음"}
              </span>
              <div style={{
                whiteSpace: "pre-wrap",
                fontSize: 15,
                color: c.is_deleted ? "#721c24" : "#222",
              }}>
                {c.is_deleted ? "삭제된 댓글입니다." : renderContent(c.content, c.Mentions)}
              </div>
            </div>
          </div>
        ) : null
      )}
      {allComments.length > 3 && (
        <div
          style={{
            color: "#2995f4",
            fontSize: 15,
            fontWeight: 500,
            marginTop: 3,
            userSelect: "none",
          }}
        >
          댓글 더보기
        </div>
      )}
    </div>
  );
};

export default CommentPreview;
