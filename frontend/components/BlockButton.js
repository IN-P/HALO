import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { BLOCK_USER_REQUEST, UNBLOCK_USER_REQUEST } from "../reducers/block";

const BlockButton = ({ toUserId, isBlocked: initialBlocked, onRefetch }) => {
  const dispatch = useDispatch();
  const { blockLoading } = useSelector((state) => state.block); // 로딩 상태

  const [isBlocked, setIsBlocked] = useState(initialBlocked); // 차단 상태 로컬로 유지

  useEffect(() => {
    setIsBlocked(initialBlocked); //  외부에서 바뀌면 동기화
  }, [initialBlocked]);

  const handleClick = () => {
    if (isBlocked) {
      if (confirm("차단을 해제할까요?")) {
        dispatch({ type: UNBLOCK_USER_REQUEST, data: toUserId }); //  차단 해제 요청
        setIsBlocked(false); //  UI 상태 변경
        onRefetch?.(); // 부모에게 갱신 트리거 전달
      }
    } else {
      if (confirm("정말 차단하시겠습니까?")) {
        dispatch({ type: BLOCK_USER_REQUEST, data: toUserId }); // 차단 요청
        setIsBlocked(true); // UI 상태 변경
        onRefetch?.(); // 부모에게 갱신 트리거 전달
      }
    }
  };
  const buttonStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    cursor: blockLoading ? "not-allowed" : "pointer",
    backgroundColor: blockLoading
      ? "#cccccc"
      : isBlocked
        ? "#999999" // 차단 해제용 버튼 - 회색
        : "#999999", // 차단 버튼 - 빨강
    color: "#fff",
    transition: "background-color 0.3s",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    minWidth: "90px",
  };

  return (
    <button onClick={handleClick} disabled={blockLoading} style={buttonStyle}>
      {blockLoading ? "처리 중..." : isBlocked ? "차단 해제" : "차단하기"} {/* 율비 */}
    </button>
  );
};

BlockButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
  isBlocked: PropTypes.bool.isRequired,
  onRefetch: PropTypes.func, // 부모 UI 갱신 콜백
};

export default BlockButton;
