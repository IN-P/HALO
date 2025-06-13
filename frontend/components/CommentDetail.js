import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined, MoreOutlined, FlagOutlined } from "@ant-design/icons";
import MentionTextArea from "./MentionTextArea";
import {
  ADD_COMMENT_REQUEST,
  EDIT_COMMENT_REQUEST,
  REMOVE_COMMENT_REQUEST,
} from "../reducers/comment_IN";

const CommentDetail = ({
  postId,
  currentUserId,
  comments = [],
}) => {
  const dispatch = useDispatch();
  const { addCommentLoading, editCommentLoading } = useSelector((state) => state.comment_IN);

  // 인풋창 상태
  const [inputValue, setInputValue] = useState('');
  const [replyTarget, setReplyTarget] = useState(null); // { id, nickname }
  const inputRef = useRef(null);

  // 수정 관련
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // 쩜3개 메뉴
  const [menuOpenId, setMenuOpenId] = useState(null);

  // 답글 달기 핸들러 (답글 대상 세팅 + 인풋 프리셋)
  const onReplyClick = (comment) => {
    setReplyTarget({ id: comment.id, nickname: comment.User.nickname });
    setInputValue(`@${comment.User.nickname} `);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // 댓글/답글 등록
  const onSubmit = () => {
    if (!inputValue.trim()) return;
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId,
        content: inputValue,
        parentId: replyTarget?.id || null,
      },
    });
    setInputValue('');
    setReplyTarget(null);
  };

  // 수정 핸들러
  const onEdit = (c) => {
    setEditId(c.id);
    setEditValue(c.content);
    setMenuOpenId(null);
  };
  const onEditSubmit = (c) => {
    if (!editValue.trim()) return;
    dispatch({
      type: EDIT_COMMENT_REQUEST,
      data: { commentId: c.id, postId, content: editValue },
    });
    setEditId(null);
    setEditValue("");
  };
  const onDelete = (c) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      dispatch({ type: REMOVE_COMMENT_REQUEST, data: { commentId: c.id, postId } });
      setMenuOpenId(null);
    }
  };
  const onReport = (c) => {
    setMenuOpenId(null);
    alert("신고 처리(예시)");
  };

  // 댓글/답글 컨텐츠 표시 (멘션/해시태그 지원)
  const renderContent = (content, mentions = []) => {
    if (!content) return null;
    const userMap = {};
    mentions.forEach(m => {
      userMap[m.nickname?.toLowerCase()] = m.user_id;
    });
    return content.split(/(#[^\s#]+|@[^\s@]+)/g).filter(Boolean).map((part, i) => {
      if (part.startsWith("#")) {
        return (
          <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: "#007bff", textDecoration: "none" }}>
            {part}
          </a>
        );
      }
      if (part.startsWith("@")) {
        const nickname = part.slice(1).toLowerCase();
        const userId = userMap[nickname];
        return userId ? (
          <a key={i} href={`/profile/${userId}`} style={{ color: "#28a745", textDecoration: "none" }}>
            {part}
          </a>
        ) : (
          <span key={i} style={{ color: "#28a745" }}>{part}</span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // 트리 구조 (댓글/대댓글 2뎁스)
  const renderComments = (list) =>
    list?.map((c) => {
      if (!c || typeof c.id === "undefined") return null;
      const isAuthor = currentUserId === c.User?.id;
      const replies = c.replies || [];
      return (
        <div key={c.id} style={commentCardStyle}>
          <img
            src={c.User?.profile_img ? `http://localhost:3065${c.User.profile_img}` : "/img/profile/default.jpg"}
            alt="avatar"
            style={avatarStyle}
            onClick={() => window.location.href = `/profile/${c.User?.id}`}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{ fontWeight: "bold", fontSize: 15, cursor: "pointer" }}
                onClick={() => window.location.href = `/profile/${c.User?.id}`}
              >
                {c.User?.nickname || "알 수 없음"}
              </span>
              <span style={{ color: "#aaa", fontSize: 12 }}>{c.createdAt?.slice(0, 10)}</span>
              <div style={{ position: "relative", marginLeft: "auto" }}>
                <button
                  style={moreBtnStyle}
                  onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                ><MoreOutlined /></button>
                {menuOpenId === c.id && (
                  <div style={popoverMenuStyle}>
                    {isAuthor && !c.is_deleted ? (
                      <>
                        <button style={menuItemStyle} onClick={() => onEdit(c)}>
                          <EditOutlined /> 수정
                        </button>
                        <button style={{ ...menuItemStyle, color: "red" }} onClick={() => onDelete(c)}>
                          <DeleteOutlined /> 삭제
                        </button>
                      </>
                    ) : (
                      <button style={menuItemStyle} onClick={() => onReport(c)}>
                        <FlagOutlined /> 신고
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{
              color: c.is_deleted ? "#721c24" : "#222",
              fontSize: 15, whiteSpace: "pre-wrap", marginTop: 2
            }}>
              {c.is_deleted
                ? "삭제된 댓글입니다."
                : (editId === c.id
                  ? (
                    <span>
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        style={{
                          width: "70%",
                          padding: 6,
                          borderRadius: 4,
                          border: "1px solid #ccc",
                          marginRight: 4,
                          fontSize: 14,
                        }}
                      />
                      <button style={btnStyle} onClick={() => onEditSubmit(c)} disabled={editCommentLoading}>완료</button>
                      <button style={btnStyle} onClick={() => setEditId(null)}>취소</button>
                    </span>
                  )
                  : renderContent(c.content, c.Mentions)
                )
              }
            </div>
            {/* 답글달기: 오른쪽 인풋에서만 처리, 버튼은 아래처럼 인풋에 parentId 세팅 */}
            {replies.length > 0 && (
              <button
                style={replyBtnStyle}
                onClick={() => onReplyClick(c)}
              >
                답글달기 ({replies.length})
              </button>
            )}
            {/* 답글들 */}
            {replies.length > 0 && (
              <div style={{ marginLeft: 36, marginTop: 6 }}>
                {replies.map((r) => renderComments([r]))}
              </div>
            )}
          </div>
        </div>
      );
    });

  // 스크롤(댓글영역)과 인풋 분리: 전체영역 flex, 댓글리스트만 overflowY
  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#fafbfc", borderRadius: 14,
    }}>
      <div style={{
        flex: 1, minHeight: 0, overflowY: "auto", padding: "0 10px",
      }}>
        {(!comments || comments.length === 0) && (
          <div style={{ color: "#aaa", margin: 8 }}>아직 댓글이 없습니다.</div>
        )}
        {Array.isArray(comments) && renderComments(comments)}
      </div>
      <div style={{
        borderTop: "1px solid #f1f1f1", background: "#fafbfc", padding: "14px 10px", position: "relative"
      }}>
        <MentionTextArea
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={replyTarget ? `@${replyTarget.nickname} 에게 답글달기` : "댓글을 입력하세요..."}
        />
        {replyTarget && (
          <button
            style={{
              position: "absolute", top: 12, right: 115,
              background: "none", border: "none", color: "#2995f4", fontSize: 14, cursor: "pointer"
            }}
            onClick={() => { setReplyTarget(null); setInputValue(""); }}
          >× 답글취소</button>
        )}
        <button
          style={{ ...btnStyle, float: "right", marginTop: 6, padding: "7px 22px" }}
          disabled={addCommentLoading}
          onClick={onSubmit}
        >
          등록
        </button>
        <div style={{ clear: "both" }} />
      </div>
    </div>
  );
};

const commentCardStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  borderBottom: "1px solid #eee",
  padding: "10px 4px 10px 0",
  marginBottom: 2,
  background: "none",
};
const avatarStyle = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid #eee",
  flexShrink: 0,
  cursor: "pointer",
  marginTop: 2,
};
const btnStyle = {
  background: "#f2f2f2",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  color: "#222",
  padding: "5px 14px",
  marginLeft: 5,
  cursor: "pointer",
};
const moreBtnStyle = {
  background: "none",
  border: "none",
  color: "#999",
  fontSize: 18,
  padding: 2,
  cursor: "pointer",
};
const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "8px 18px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 15,
  color: "#444",
};
const popoverMenuStyle = {
  position: "absolute",
  right: 0,
  top: 28,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  borderRadius: 8,
  zIndex: 100,
  minWidth: 100,
};
const replyBtnStyle = {
  background: "none",
  border: "none",
  color: "#2995f4",
  fontWeight: 500,
  fontSize: 14,
  padding: 0,
  cursor: "pointer",
  marginTop: 4,
  marginBottom: 2,
};

export default CommentDetail;
