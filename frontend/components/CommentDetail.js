import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ADD_COMMENT_REQUEST,
  LOAD_COMMENTS_REQUEST,
  EDIT_COMMENT_REQUEST,
  REMOVE_COMMENT_REQUEST,
} from "../reducers/comment_IN";
import MentionTextArea from "./MentionTextArea";
import { EditOutlined, DeleteOutlined, MoreOutlined, FlagOutlined } from "@ant-design/icons";
import { FaLevelUpAlt } from 'react-icons/fa';

const CommentDetail = ({ postId, currentUserId }) => {
  const dispatch = useDispatch();
  const mentionUserMap = useSelector((state) => state.mentionUser_JW?.mentionUserMap || {});
  const { comments: allComments, addCommentLoading, editCommentLoading, loadCommentsDone } = useSelector((state) => state.comment_IN);

  const [receiverIdMap, setReceiverIdMap] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [openReplies, setOpenReplies] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch({ type: "LOAD_MENTION_USERS_REQUEST" });
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
  }, [postId]);

  const comments = allComments[postId] || [];

  const toggleReplies = (commentId) => {
    setOpenReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const onReplyClick = (comment) => {
    const mentionText = `@${comment.User.nickname} `;
    setReplyTarget({ id: comment.id, nickname: comment.User.nickname });
    setInputValue(mentionText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const length = mentionText.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 50);
  };

  const onSubmit = () => {
    if (!inputValue.trim()) return;
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId,
        content: inputValue,
        parentId: replyTarget?.id || null,
        receiver_id: replyTarget ? receiverIdMap[replyTarget.id] : receiverIdMap[0],
      },
    });
    setInputValue("");
    setReplyTarget(null);

    // 트리 새로 고침 바로 실행 (addCommentDone 기다리지 않음)
    setTimeout(() => {
      dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
    }, 300);
  };

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
    setTimeout(() => {
      dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
    }, 300);
  };

  const onDelete = (c) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      dispatch({ type: REMOVE_COMMENT_REQUEST, data: { commentId: c.id, postId } });
      setMenuOpenId(null);
      setTimeout(() => {
        dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
      }, 300);
    }
  };

  const onReport = (c) => {
    setMenuOpenId(null);
    alert("신고 처리(예시)");
  };

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

  const renderComments = (list) => {
    const sorted = [...list].sort((a, b) => b.id - a.id);
    return sorted.map((c) => {
      if (!c || typeof c.id === "undefined") return null;
      const isAuthor = currentUserId === c.User?.id;
      const replies = c.replies || [];
      const isReply = !!c.parent_id;
      const isRepliesOpen = openReplies[c.id];

      return (
        <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: isReply ? "7px 0" : "10px 0", marginBottom: isReply ? 1 : 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {isReply && <FaLevelUpAlt style={{ transform: "rotate(90deg)", color: "#bbb", fontSize: 14, marginTop: 1 }} />}
            <img
              src={c.User?.profile_img ? `http://localhost:3065${c.User.profile_img}` : "/img/profile/default.jpg"}
              alt="avatar"
              style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid #eee", flexShrink: 0, cursor: "pointer", marginTop: 2 }}
              onClick={() => window.location.href = `/profile/${c.User?.id}`}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: "bold", fontSize: 15, cursor: "pointer" }} onClick={() => window.location.href = `/profile/${c.User?.id}`}>{c.User?.nickname || "알 수 없음"}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>{c.createdAt?.slice(0, 10)}</span>
              <div style={{ position: "relative", marginLeft: "auto" }}>
                <button style={moreBtnStyle} onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}><MoreOutlined /></button>
                {menuOpenId === c.id && (
                  <div style={popoverMenuStyle}>
                    {isAuthor && !c.is_deleted ? (
                      <>
                        <button style={menuItemStyle} onClick={() => onEdit(c)}><EditOutlined /> 수정</button>
                        <button style={{ ...menuItemStyle, color: "red" }} onClick={() => onDelete(c)}><DeleteOutlined /> 삭제</button>
                      </>
                    ) : (
                      <button style={menuItemStyle} onClick={() => onReport(c)}><FlagOutlined /> 신고</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ color: c.is_deleted ? "#721c24" : "#222", fontSize: 15, whiteSpace: "pre-wrap", marginTop: 2 }}>
              {c.is_deleted ? "삭제된 댓글입니다." : (editId === c.id ? (
                <span>
                  <input value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: "70%", padding: 6, borderRadius: 4, border: "1px solid #ccc", marginRight: 4, fontSize: 14 }} />
                  <button style={btnStyle} onClick={() => onEditSubmit(c)} disabled={editCommentLoading}>완료</button>
                  <button style={btnStyle} onClick={() => setEditId(null)}>취소</button>
                </span>
              ) : renderContent(c.content, c.Mentions, c.Parent?.User?.nickname))}
            </div>
            {c.parent_id === null && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button style={replyBtnStyle} onClick={() => onReplyClick(c)}>답글달기</button>
                {replies.length > 0 && (
                  <button style={replyBtnStyle} onClick={() => toggleReplies(c.id)}>
                    {isRepliesOpen ? '답글 숨기기' : `답글 보기 (${replies.length})`}
                  </button>
                )}
              </div>
            )}
            {isRepliesOpen && replies.length > 0 && renderComments(replies)}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fafbfc", borderRadius: 14 }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 10px" }}>
        {(!comments || comments.length === 0) && (
          <div style={{ color: "#aaa", margin: 8 }}>아직 댓글이 없습니다.</div>
        )}
        {Array.isArray(comments) && renderComments(comments.filter(c => !c.parent_id))}
      </div>
      <div style={{ borderTop: "1px solid #f1f1f1", background: "#fafbfc", padding: "12px 12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <MentionTextArea
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onMentionSelect={(user) => {
              if (replyTarget) {
                setReceiverIdMap(prev => ({ ...prev, [replyTarget.id]: user.id }));
              } else {
                setReceiverIdMap({ 0: user.id });
              }
            }}
            placeholder={replyTarget ? `@${replyTarget.nickname} 에게 답글달기` : "댓글을 입력하세요..."}
            style={{ width: '100%', minHeight: 72, fontSize: 15, borderRadius: 8, border: '1px solid #ccc', padding: '12px 16px', resize: 'none', background: "#fff" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "stretch", height: 68, minWidth: 64, gap: 6 }}>
          <button style={actionBtnStyle} disabled={addCommentLoading} onClick={onSubmit}>등록</button>
          {replyTarget && (
            <button style={actionBtnStyle} onClick={() => { setReplyTarget(null); setInputValue(""); }}>취소</button>
          )}
        </div>
      </div>
    </div>
  );
};

const btnStyle = { background: "#f2f2f2", border: "none", borderRadius: 6, fontSize: 13, color: "#222", padding: "5px 14px", marginLeft: 5, cursor: "pointer" };
const actionBtnStyle = { width: "100%", height: 28, background: "#2296f3", border: "none", borderRadius: 7, color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer", margin: 0, padding: 0 };
const moreBtnStyle = { background: "none", border: "none", color: "#999", fontSize: 18, padding: 2, cursor: "pointer" };
const menuItemStyle = { display: "block", width: "100%", padding: "8px 18px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 15, color: "#444" };
const popoverMenuStyle = { position: "absolute", right: 0, top: 28, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", borderRadius: 8, zIndex: 100, minWidth: 100 };
const replyBtnStyle = { background: "none", border: "none", color: "#2995f4", fontWeight: 500, fontSize: 14, padding: 0, cursor: "pointer", marginTop: 4, marginBottom: 2 };

export default CommentDetail;