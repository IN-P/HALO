import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { BLOCK_USER_REQUEST, UNBLOCK_USER_REQUEST } from "../reducers/block";

const BlockButton = ({ toUserId, isBlocked: initialBlocked, onRefetch }) => {
  const dispatch = useDispatch();
  const { blockLoading } = useSelector((state) => state.block); // 율비: 로딩 상태

  const [isBlocked, setIsBlocked] = useState(initialBlocked); // 율비: 차단 상태 로컬로 유지

  useEffect(() => {
    setIsBlocked(initialBlocked); // 율비: 외부에서 바뀌면 동기화
  }, [initialBlocked]);

  const handleClick = () => {
    if (isBlocked) {
      if (confirm("차단을 해제할까요?")) {
        dispatch({ type: UNBLOCK_USER_REQUEST, data: toUserId }); // 율비: 차단 해제 요청
        setIsBlocked(false); // 율비: UI 상태 변경
        onRefetch?.(); // 율비: 부모에게 갱신 트리거 전달
      }
    } else {
      if (confirm("정말 차단하시겠습니까?")) {
        dispatch({ type: BLOCK_USER_REQUEST, data: toUserId }); // 율비: 차단 요청
        setIsBlocked(true); // 율비: UI 상태 변경
        onRefetch?.(); // 율비: 부모에게 갱신 트리거 전달
      }
    }
  };

  return (
    <button onClick={handleClick} disabled={blockLoading}>
      {blockLoading ? "처리 중..." : isBlocked ? "차단 해제" : "차단하기"} {/* 율비 */}
    </button>
  );
};

BlockButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
  isBlocked: PropTypes.bool.isRequired,
  onRefetch: PropTypes.func, // 율비: 부모 UI 갱신 콜백
};

export default BlockButton;
