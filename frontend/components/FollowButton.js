import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from "../reducers/follow_YB";
import { useAuth } from "../hooks/useAuth";

const FollowButton = ({ toUserId, onRefetch }) => { // 율비: onRefetch props 받아옴
  const dispatch = useDispatch();
  const { user: currentUser, loading } = useAuth();
  const followLoading = useSelector(
    (state) => state.follow_YB?.followLoading || false
  );
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollow = async () => {
      try {
        const res = await axios.get(`/follow/check/${toUserId}`, {
          withCredentials: true,
        });
        setIsFollowing(res.data.isFollowing);
        console.log("🔎 팔로우 상태 확인:", res.data.isFollowing); // 율비
      } catch (err) {
        console.error("❌ 팔로우 상태 확인 실패", err);
      }
    };

    if (currentUser && toUserId !== currentUser.id) {
      checkFollow(); // 율비: 유저 바뀌면 팔로우 상태 확인
    }
  }, [toUserId, currentUser,onRefetch]); // 율비: 의존성 확인

  if (loading || !currentUser || currentUser.id === toUserId) return null;

  const handleClick = () => {
    console.log("📤 toUserId 전송:", toUserId);
    if (isFollowing) {
      dispatch({ type: UNFOLLOW_REQUEST, data: toUserId }); // 율비
      setIsFollowing(false); // 율비: UI 상태 직접 변경
    } else {
      dispatch({ type: FOLLOW_REQUEST, data: toUserId }); // 율비
      setIsFollowing(true); // 율비
    }

    onRefetch?.(); // 율비: 부모 컴포넌트 갱신 유도
  };

  return (
    <button onClick={handleClick} disabled={followLoading}>
      {followLoading ? "처리 중..." : isFollowing ? "언팔로우" : "팔로우"} {/* 율비 */}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
  onRefetch: PropTypes.func, // 율비: 부모로부터 전달받는 갱신 함수
};

export default FollowButton;
