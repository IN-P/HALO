import React from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from "../reducers/follow_YB";
import { useAuth } from "../hooks/useAuth";

const FollowButton = ({ toUserId }) => {
  const dispatch = useDispatch();
  const { user: currentUser , loading } = useAuth(); // 로그인 유저

  if (loading) {
    return null; // 로그인 정보 로딩 중이면 아무것도 렌더링하지 않음
  }

  if (!currentUser || currentUser.id === toUserId) {
    console.log("🚫 자기 자신의 글이거나 로그인 안됨");
    return null;
  }

  const followState = useSelector((state) => state.follow_YB || {
    followingList: [],
    followLoading: false,
  });

  // 🔍 follow_YB 상태가 아직 초기화 안 됐을 경우
  if (!followState) {
    console.warn("⚠️ follow_YB 상태가 아직 Redux에 초기화되지 않았습니다.");
    return null;
  }

  const { followingList, followLoading } = followState;
  const isFollowing = followingList.includes(toUserId);

  const handleClick = () => {
     console.log("📤 toUserId 전송:", toUserId); // ✅ 이 줄 추가
    if (isFollowing) {
      dispatch({ type: UNFOLLOW_REQUEST, data: toUserId });
    } else {
      dispatch({ type: FOLLOW_REQUEST, data: toUserId });
    }
  };

  console.log("✅ FollowButton 렌더링 완료");

  return (
    <button onClick={handleClick} disabled={followLoading} >
      {isFollowing ? "언팔로우" : "팔로우"}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
};

export default FollowButton;
