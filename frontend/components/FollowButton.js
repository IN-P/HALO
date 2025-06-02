import React, { useState, useEffect } from "react";
import axios from 'axios';
import PropTypes from "prop-types";

const FollowButton = ({ toUserId, fromUserId, initialIsFollowing }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing); //현재 팔로우상태 초기값

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:3065/api/following/${toUserId}`);
      } else {
        await axios.post(`http://localhost:3065/api/follow`, { toUserId });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('팔로우 처리 실패', err);
    }
  };

  if (fromUserId == toUserId) return null;

  return (
    <button onClick={handleFollow}>
      {isFollowing ? '언팔로우' : '팔로우'}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
  fromUserId: PropTypes.number.isRequired,
  initialIsFollowing: PropTypes.bool,
};

FollowButton.defaultProps = {
  initialIsFollowing: false,
};

export default FollowButton;

////포스트카드 and user프로필에 추가
/* 
import FollowButton from './FollowButton';

<FollowButton
  toUserId={targetUser.id}
  fromUserId={loginUser.id}
  initialIsFollowing={true}
/>
*/