import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LOAD_COMMENTS_REQUEST,
  ADD_COMMENT_REQUEST,
} from "../reducers/comment_IN";

const Comment = ({ postId, currentUserId }) => {
  const dispatch = useDispatch();
  const { comments, addCommentLoading } = useSelector((state) => state.comment_IN);
  const [inputMap, setInputMap] = useState({}); // { [commentId]: string }

  useEffect(() => {
    dispatch({ type: LOAD_COMMENTS_REQUEST, postId });
  }, [dispatch, postId]);

  // 댓글 입력 상태
  const onChangeInput = (id, value) =>
    setInputMap((prev) => ({ ...prev, [id]: value }));

  // 댓글/대댓글 등록
  const onSubmit = (parentId) => {
    dispatch({
      type: ADD_COMMENT_REQUEST,
      data: {
        postId,
        content: inputMap[parentId || 0],
        parentId: parentId || null,
      },
    });
    setInputMap((prev) => ({ ...prev, [parentId || 0]: "" }));
  };

  // 트리 재귀 렌더
  const renderTree = (list, depth = 0) =>
    list.map((comment) => (
      <div key={comment.id} style={{ marginLeft: depth * 24, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <b>{comment.User?.nickname}</b>
          <span style={{ color: "#888" }}>{comment.content}</span>
          {comment.is_deleted && <span style={{ color: "red" }}>삭제됨</span>}
        </div>
        {/* 대댓글 입력창 */}
        <div style={{ marginTop: 2 }}>
          <input
            value={inputMap[comment.id] || ""}
            onChange={(e) => onChangeInput(comment.id, e.target.value)}
            placeholder="대댓글 입력"
            style={{ width: 240 }}
          />
          <button
            disabled={addCommentLoading}
            onClick={() => onSubmit(comment.id)}
          >
            등록
          </button>
        </div>
        {/* 대댓글들 */}
        {comment.replies && renderTree(comment.replies, depth + 1)}
      </div>
    ));

  // 최상위 댓글 입력
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <input
          value={inputMap[0] || ""}
          onChange={(e) => onChangeInput(0, e.target.value)}
          placeholder="댓글 입력"
          style={{ width: 300 }}
        />
        <button
          disabled={addCommentLoading}
          onClick={() => onSubmit(null)}
        >
          등록
        </button>
      </div>
      {Array.isArray(comments[postId]) && comments[postId].length === 0 && (
        <div style={{ color: '#aaa', marginLeft: 4 }}>아직 댓글이 없습니다.</div>
      )}
      {Array.isArray(comments[postId]) && renderTree(comments[postId])}
    </div>
  );
};

export default Comment;
