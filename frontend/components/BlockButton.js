import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BLOCK_USER_REQUEST, UNBLOCK_USER_REQUEST } from '../reducers/block';

const BlockButton = ({ toUserId, isBlocked }) => {
  const dispatch = useDispatch();
  const { blockLoading } = useSelector((state) => state.block);

  const handleClick = () => {
    if (isBlocked) {
      if (confirm('차단을 해제할까요?')) {
        dispatch({ type: UNBLOCK_USER_REQUEST, data: toUserId });
      }
    } else {
      if (confirm('정말 차단하시겠습니까?')) {
        dispatch({ type: BLOCK_USER_REQUEST, data: toUserId });
      }
    }
  };

  return (
    <button onClick={handleClick} disabled={blockLoading}>
      {blockLoading ? '처리 중...' : isBlocked ? '차단 해제' : '차단하기'}
    </button>
  );
};

export default BlockButton;
