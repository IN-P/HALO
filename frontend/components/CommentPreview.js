import React from "react";
import { MessageOutlined } from "@ant-design/icons";

const CommentPreview = ({
  comments = [],
  onShowDetailModal,
  previewCount = 3,
}) => {
  if (!Array.isArray(comments)) return null;

  const sorted = [...comments].sort((a, b) => b.id - a.id);
  const previewComments = sorted.slice(0, previewCount);

  return (
    <div
      className="comment-preview-wrap"
      onClick={onShowDetailModal}
      style={{
        background: "#fafbfc",
        borderRadius: 10,
        minHeight: 50,
        padding: "12px 16px 8px 16px",
        border: "1px solid #f2f2f2",
        fontSize: 15,
        color: "#333",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
        <MessageOutlined style={{ fontSize: 17, color: "#888" }} />
        <span style={{ marginLeft: 8, color: "#555", fontWeight: 500 }}>
          댓글
        </span>
      </div>
      {previewComments.length === 0 && (
        <div style={{ color: "#b0b0b0", fontStyle: "italic", fontSize: 15 }}>
          아직 댓글이 없습니다 🙃
        </div>
      )}
      {previewComments.map((c) =>
        c && c.User ? (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 0 0 0",
              borderBottom: "1px solid #f4f4f4",
              minHeight: 36,
            }}
          >
            <img
              src={
                c.User?.profile_img
                  ? `http://localhost:3065${c.User.profile_img}`
                  : "/img/profile/default.jpg"
              }
              alt="avatar"
              style={{
                width: 26,
                height: 26,
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
            <span
              style={{
                fontWeight: "bold",
                marginRight: 5,
                fontSize: 14,
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profile/${c.User?.id}`;
              }}
            >
              {c.User?.nickname || "알 수 없음"}
            </span>
            <span style={{ color: "#444", fontSize: 15, flex: 1 }}>
              {c.is_deleted ? (
                <span style={{ color: "#bb0d23" }}>삭제된 댓글입니다.</span>
              ) : (
                c.content
              )}
            </span>
          </div>
        ) : null
      )}
      {comments.length > previewCount && (
        <div
          style={{
            color: "#2995f4",
            fontSize: 15,
            fontWeight: 500,
            marginTop: 5,
            userSelect: "none",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          댓글 더보기
        </div>
      )}
    </div>
  );
};

export default CommentPreview;
