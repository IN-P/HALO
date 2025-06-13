import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LOAD_COMMENTS_REQUEST,
  ADD_COMMENT_REQUEST,
  EDIT_COMMENT_REQUEST,
  REMOVE_COMMENT_REQUEST,
} from "../reducers/comment_IN";
import MentionTextArea from '../components/MentionTextArea';

const Comment = ({ postId, currentUserId, initialComments = [] }) => {
  const dispatch = useDispatch();
  const { comments, loadCommentsDone, addCommentLoading, editCommentLoading } = useSelector((state) => state.comment_IN);

  // 댓글 트리: 1depth(댓글), 2depth(대댓글)까지만
  const effectiveComments = comments[postId] && loadCommentsDone?.[postId]
    ? comments[postId]
    : initialComments;

  // 댓글 입력
  const [commentInput, setCommentInput] = useState("");
  const [replyInputMap, setReplyInputMap] = useState({});
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showReplyInput, setShowReplyInput] = useState({});

  // 댓글 등록
  const onAddComment = () => {
    if (!commentInput.trim()) return;
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: { postId, content: commentInput, parentId: null },
    });
    setCommentInput("");
  };

  // 대댓글 등록
  const onAddReply = (parentId, nickname) => {
    if (!replyInputMap[parentId]?.trim()) return;
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId,
        content: replyInputMap[parentId].startsWith(`@${nickname}`) ? replyInputMap[parentId] : `@${nickname} ${replyInputMap[parentId]}`,
        parentId,
      },
    });
    setReplyInputMap((prev) => ({ ...prev, [parentId]: "" }));
    setShowReplyInput((prev) => ({ ...prev, [parentId]: false }));
  };

  // 댓글 수정
  const onEdit = (comment) => {
    setEditId(comment.id);
    setEditValue(comment.content);
  };
  const onEditSubmit = (comment) => {
    if (!editValue.trim()) return;
    dispatch({
      type: EDIT_COMMENT_REQUEST,
      data: { commentId: comment.id, postId, content: editValue },
    });
    setEditId(null);
    setEditValue("");
  };

  // 댓글 삭제
  const onDelete = (comment) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      dispatch({ type: REMOVE_COMMENT_REQUEST, data: { commentId: comment.id, postId } });
    }
  };

  // 댓글, 대댓글 content 표시 (멘션/해시태그 자동 링크)
  const renderContent = (content, mentions = [], parentNickname) => {
    if (!content) return null;
    const userMap = {};
    mentions.forEach(m => {
      userMap[m.nickname?.toLowerCase()] = m.user_id;
    });
    let text = content;
    let showParentNickname = false;
    if (parentNickname && content.startsWith(`@${parentNickname}`)) {
      text = content.slice(parentNickname.length + 1).trimStart();
      showParentNickname = true;
    }
    return (
      <>
        {showParentNickname && <b>@{parentNickname} </b>}
        {text.split(/(#[^\s#]+|@[^\s@]+)/g).filter(Boolean).map((part, i) => {
          if (part.startsWith('#')) {
            return (
              <a key={i} href={`/hashtag/${part.slice(1)}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                {part}
              </a>
            );
          }
          if (part.startsWith('@')) {
            const nickname = part.slice(1).toLowerCase();
            const userId = userMap[nickname];
            return userId ? (
              <a key={i} href={`/profile/${userId}`} style={{ color: '#28a745', textDecoration: 'none' }}>
                {part}
              </a>
            ) : (
              <span key={i} style={{ color: '#28a745' }}>{part}</span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  };

  // 댓글/대댓글 렌더링
  const renderComments = (list) =>
    list?.map((c) => {
      if (!c || typeof c.id === "undefined") return null;
      const isAuthor = currentUserId === c.User?.id;
      const replies = c.replies || [];
      return (
        <div key={c.id} style={{ borderBottom: "1px solid #eee", marginBottom: 8, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src={c.User?.profile_img ? `http://localhost:3065${c.User.profile_img}` : "/img/profile/default.jpg"}
              alt="avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
            />
            <span style={{ fontWeight: "bold" }}>{c.User?.nickname || "알 수 없음"}</span>
            <span style={{ marginLeft: 6, color: "#aaa", fontSize: 12 }}>{c.createdAt?.slice(0, 10)}</span>
            {isAuthor && !c.is_deleted && (
              <>
                <button style={btnStyle} onClick={() => onEdit(c)}>수정</button>
                <button style={btnStyle} onClick={() => onDelete(c)}>삭제</button>
              </>
            )}
          </div>
          <div style={{ marginLeft: 38, color: c.is_deleted ? "#721c24" : "#222" }}>
            {c.is_deleted
              ? "삭제된 댓글입니다."
              : editId === c.id
              ? (
                <span>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ width: "70%" }}
                  />
                  <button style={btnStyle} onClick={() => onEditSubmit(c)} disabled={editCommentLoading}>수정완료</button>
                  <button style={btnStyle} onClick={() => setEditId(null)}>취소</button>
                </span>
              )
              : renderContent(c.content, c.Mentions, c.Parent?.User?.nickname)
            }
          </div>
          {/* 답글(대댓글) 달기 버튼은 1depth(댓글)에만 노출 */}
          {!c.is_deleted && replies.length >= 0 && c.parent_id === null && (
            <div style={{ marginLeft: 38, marginTop: 3 }}>
              {showReplyInput[c.id] ? (
                <span>
                  <MentionTextArea
                    value={replyInputMap[c.id] || ""}
                    onChange={(e) => setReplyInputMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  />
                  <button
                    style={btnStyle}
                    disabled={addCommentLoading}
                    onClick={() => onAddReply(c.id, c.User?.nickname)}
                  >등록</button>
                  <button style={btnStyle} onClick={() => setShowReplyInput((prev) => ({ ...prev, [c.id]: false }))}>취소</button>
                </span>
              ) : (
                <button style={btnStyle} onClick={() => setShowReplyInput((prev) => ({ ...prev, [c.id]: true }))}>
                  답글 달기
                </button>
              )}
            </div>
          )}
          {/* 대댓글(2depth) 렌더링 */}
          {replies.length > 0 && (
            <div style={{ marginLeft: 48, borderLeft: "2px solid #e9e9e9", paddingLeft: 8, marginTop: 6 }}>
              {renderComments(replies)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div style={{ background: "#fafbfc", borderRadius: 12, padding: 10, marginTop: 10 }}>
      {/* 댓글 입력창 */}
      <div style={{ marginBottom: 16 }}>
        <MentionTextArea
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button
          style={btnStyle}
          disabled={addCommentLoading}
          onClick={onAddComment}
        >댓글 등록</button>
      </div>
      {/* 댓글/대댓글 트리 */}
      {(!effectiveComments || effectiveComments.length === 0) && (
        <div style={{ color: "#aaa" }}>아직 댓글이 없습니다.</div>
      )}
      {Array.isArray(effectiveComments) && renderComments(effectiveComments)}
    </div>
  );
};

const btnStyle = {
  background: "#eee",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  color: "#222",
  padding: "3px 10px",
  marginLeft: 5,
  cursor: "pointer",
};

export default Comment;
