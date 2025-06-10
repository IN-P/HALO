import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  LOAD_COMMENTS_REQUEST,
  ADD_COMMENT_REQUEST,
  EDIT_COMMENT_REQUEST,
  REMOVE_COMMENT_REQUEST,
} from "../reducers/comment_IN";
import ReportButton from "./ReportButton";
import ReportModal from "./ReportModal";
import { getTotalCommentCount, flattenComments } from "../utils/comment";

// 스타일 정의 생략(아래쪽에 있음)

const Comment = ({
  postId,
  currentUserId,
  preview = false,
  previewCount = 3,
  onShowDetailModal,
  initialComments, // SSR/post.Comments
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { comments, addCommentLoading } = useSelector((state) => state.comment_IN);

  // SSR fallback
  let listFromRedux = comments[postId];
  let listFromProps = Array.isArray(initialComments) ? initialComments : [];
  let effectiveComments =
    Array.isArray(listFromRedux) && listFromRedux.length > 0
      ? listFromRedux
      : listFromProps;

  useEffect(() => {
    dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
  }, [dispatch, postId]);

  if (preview) {
    // 삭제 댓글 포함 전체 평탄화+정렬
    const allComments = flattenComments(effectiveComments);
    const sorted = [...allComments].sort((a, b) => b.id - a.id);
    const previewComments = sorted.slice(0, previewCount);

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
          cursor: onShowDetailModal ? "pointer" : "default", // 커서
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
                src={
                  c.User?.profile_img
                    ? `http://localhost:3065${c.User.profile_img}`
                    : "http://localhost:3065/img/profile/default.jpg"
                }
                alt="avatar"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #eee",
                  flexShrink: 0,
                  cursor: "default",
                }}
              />
              <div style={{ flex: 1 }}>
                <b>{c.User?.nickname || "알 수 없음"}</b>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 15,
                    color: c.is_deleted ? "#721c24" : "#222",
                  }}
                >
                  {c.is_deleted
                    ? "삭제된 댓글입니다."
                    : c.content}
                </div>
              </div>
            </div>
          ) : null
        )}
        {allComments.length > previewCount && (
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
  }

  // [코멘트 입력 등 상태]
  const [openMap, setOpenMap] = useState({});
  const [inputMap, setInputMap] = useState({});
  const [showInputMap, setShowInputMap] = useState({});
  const [menuOpenMap, setMenuOpenMap] = useState({});
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const menuRefs = useRef({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);

  const onReplyShow = (id) => {
    setOpenMap((prev) => ({ ...prev, [id]: true }));
    setShowInputMap((prev) => ({ ...prev, [id]: true }));
  };
  const onReplyHide = (id) => {
    setOpenMap((prev) => ({ ...prev, [id]: false }));
    setShowInputMap((prev) => ({ ...prev, [id]: false }));
    setInputMap((prev) => ({ ...prev, [id]: "" }));
  };
  const onReplyInputShow = (id) => {
    setShowInputMap((prev) => ({ ...prev, [id]: true }));
  };
  const onReplySubmit = (parentId, nickname) => {
    if (!inputMap[parentId]?.trim()) return;
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId,
        content: inputMap[parentId].startsWith(`@${nickname}`)
          ? inputMap[parentId]
          : `@${nickname} ${inputMap[parentId]}`,
        parentId,
      },
    });
    setInputMap((prev) => ({ ...prev, [parentId]: "" }));
    setShowInputMap((prev) => ({ ...prev, [parentId]: false }));
  };

  const onEditBtn = (comment) => {
    setEditId(comment.id);
    setEditValue(comment.content);
    setMenuOpenMap({});
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
  const onDelete = (comment) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      dispatch({ type: REMOVE_COMMENT_REQUEST, data: { commentId: comment.id, postId } });
      setMenuOpenMap({});
    }
  };
  const onOpenReportModal = (commentId) => {
    setReportTargetId(commentId);
    setReportModalOpen(true);
  };
  const toggleMenu = (id) => {
    setMenuOpenMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const onAvatarClick = (nickname) => {
    if (nickname) router.push(`/profile/${nickname}`);
  };
  const renderCommentContent = (content, parentNickname) => {
    if (!content) return null;
    let text = content;
    if (parentNickname && content.startsWith(`@${parentNickname}`)) {
      text = content.slice(parentNickname.length + 1).trimStart();
    }
    return (
      <>
        {parentNickname && <b>@{parentNickname} </b>}
        {text}
      </>
    );
  };
  const renderTree = (list, level = 0) => {
    if (!Array.isArray(list)) return null;
    return list.map((c) => {
      if (!c || typeof c.id === "undefined") return null;
      const replyList = c.replies || [];
      const replyCount = replyList.length;
      const isAuthor = currentUserId === c.User?.id;
      const isReply = level > 0;

      return (
        <React.Fragment key={c.id}>
          <div
            style={{
              display: "block",
              padding: "12px 0 0 0",
              borderBottom: "1px solid #f1f1f1",
              background: "none",
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <img
                src={
                  c.User?.profile_img
                    ? `http://localhost:3065${c.User.profile_img}`
                    : "http://localhost:3065/img/profile/default.jpg"
                }
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
                onClick={() => onAvatarClick(c.User?.nickname)}
              />
              <div style={{ flex: 1 }}>
                <b>{c.User?.nickname || "알 수 없음"}</b>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: 15,
                    color: c.is_deleted ? "#721c24" : "#222",
                  }}
                >
                  {c.is_deleted
                    ? "삭제된 댓글입니다."
                    : renderCommentContent(c.content, c.Parent?.User?.nickname)}
                </div>
              </div>
              {!c.is_deleted && (
                <div style={{ position: "relative" }} ref={(el) => (menuRefs.current[c.id] = el)}>
                  <button
                    onClick={() => toggleMenu(c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      color: "#666",
                      padding: "2px 6px",
                      outline: "none",
                    }}
                  >
                    ⋯
                  </button>
                  {menuOpenMap[c.id] && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 28,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        borderRadius: 8,
                        zIndex: 100,
                        minWidth: 100,
                      }}
                    >
                      {isAuthor ? (
                        <>
                          <button onClick={() => onEditBtn(c)} style={menuItemStyle}>
                            수정
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            style={{ ...menuItemStyle, color: "red" }}
                          >
                            삭제
                          </button>
                        </>
                      ) : (
                        <div style={{ padding: "4px 16px" }}>
                          <ReportButton
                            postId={c.id}
                            onClick={() => onOpenReportModal(c.id)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ marginTop: 2 }}>
              {!openMap[c.id] ? (
                <button style={replyButtonStyle} onClick={() => onReplyShow(c.id)}>
                  답글보기 [{replyCount}]
                </button>
              ) : (
                <>
                  {showInputMap[c.id] && !c.is_deleted && (
                    <div style={{ margin: "8px 0" }}>
                      <input
                        value={inputMap[c.id] || ""}
                        onChange={(e) =>
                          setInputMap((prev) => ({ ...prev, [c.id]: e.target.value }))
                        }
                        placeholder={`@${c.User?.nickname} 님에게 대댓글 입력`}
                        style={{
                          width: "70%",
                          padding: 6,
                          borderRadius: 4,
                          border: "1px solid #ccc",
                          marginRight: 8,
                        }}
                      />
                      <button
                        disabled={addCommentLoading}
                        onClick={() => onReplySubmit(c.id, c.User?.nickname)}
                        style={{ padding: "6px 12px", cursor: "pointer" }}
                      >
                        등록
                      </button>
                    </div>
                  )}
                  <div style={{ display: "inline-flex", gap: 6, marginBottom: 2 }}>
                    {!c.is_deleted && (
                      <button style={replyButtonStyle} onClick={() => onReplyInputShow(c.id)}>
                        답글 달기
                      </button>
                    )}
                    <button style={replyButtonStyle} onClick={() => onReplyHide(c.id)}>
                      답글 숨기기
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {editId === c.id && !c.is_deleted && (
            <div style={{ marginTop: 6 }}>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginTop: 6,
                }}
              />
              <button
                onClick={() => {
                  onEditSubmit(c);
                }}
                style={{ marginLeft: 8, padding: "6px 12px", cursor: "pointer" }}
              >
                수정완료
              </button>
              <button
                onClick={() => setEditId(null)}
                style={{ marginLeft: 4, padding: "6px 12px", cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          )}
          {openMap[c.id] && replyList.length > 0 && (
            <div style={BASKET_STYLE[level + 1] || BASKET_STYLE[BASKET_STYLE.length - 1]}>
              {renderTree(replyList, level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div
      style={{
        marginTop: 20,
        background: "#fafbfc",
        borderRadius: 14,
        padding: "5px 10px 10px 10px",
        overflowX: "hidden",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <input
          value={inputMap[0] || ""}
          onChange={(e) => setInputMap((prev) => ({ ...prev, 0: e.target.value }))}
          placeholder="댓글 입력"
          style={{
            width: "80%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
            marginRight: 8,
          }}
        />
        <button
          disabled={addCommentLoading}
          onClick={() => {
            if (!inputMap[0]?.trim()) return;
            dispatch({
              type: ADD_COMMENT_REQUEST,
              data: { postId, content: inputMap[0], parentId: null },
            });
            setInputMap((prev) => ({ ...prev, 0: "" }));
          }}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          등록
        </button>
      </div>
      {Array.isArray(effectiveComments) && effectiveComments.length === 0 && (
        <div style={{ color: "#aaa", marginLeft: 8 }}>아직 댓글이 없습니다.</div>
      )}
      {Array.isArray(effectiveComments) && renderTree(effectiveComments, 0)}
      <ReportModal
        visible={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={reportTargetId}
        targetType={2}
      />
    </div>
  );
};

const BASKET_STYLE = [
  {},
  {
    borderLeft: '2px solid #ffd2d2',
    borderRight: '2px solid #ffd2d2',
    borderBottom: '2px solid #ffd2d2',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    margin: '10px 0 10px 0',
    padding: '2px 0 2px 0',
    background: 'none',
  },
  {
    borderLeft: '2px solid #70b3ff',
    borderRight: '2px solid #70b3ff',
    borderBottom: '2px solid #70b3ff',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    margin: '10px 0 10px 0',
    padding: '2px 0 2px 0',
    background: 'none',
  },
];
const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "8px 16px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 15,
  color: "#444",
};
const replyButtonStyle = {
  marginTop: 2,
  background: "none",
  border: "none",
  color: "#555",
  cursor: "pointer",
  fontSize: 14,
  padding: 0,
};

export default Comment;
