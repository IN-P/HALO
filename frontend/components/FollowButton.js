import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from "../reducers/follow_YB";
import { useAuth } from "../hooks/useAuth";

const FollowButton = ({ toUserId, onRefetch }) => {
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
        console.log("🔎 팔로우 상태 확인:", res.data.isFollowing);
      } catch (err) {
        console.error("❌ 팔로우 상태 확인 실패", err);
      }
    };

    if (currentUser && toUserId !== currentUser.id) {
      checkFollow();
    }
  }, [toUserId, currentUser, onRefetch]);

  if (loading || !currentUser || currentUser.id === toUserId) return null;

  const handleClick = () => {
    console.log("📤 toUserId 전송:", toUserId);
    if (isFollowing) {
      dispatch({ type: UNFOLLOW_REQUEST, data: toUserId });
      setIsFollowing(false);
    } else {
      dispatch({ type: FOLLOW_REQUEST, data: toUserId });
      setIsFollowing(true);
    }

    onRefetch?.();
  };
  const buttonStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    cursor: followLoading ? "not-allowed" : "pointer",
    backgroundColor: followLoading
      ? "#cccccc"
      : isFollowing
        ? "#999999" // 언팔로우는 회색
        : "#4A98FF", // 팔로우는 파랑
    color: "#fff",
    transition: "background-color 0.3s",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    minWidth: "90px",
  };

  return (
    <button onClick={handleClick} disabled={followLoading} style={buttonStyle}>
      {followLoading ? "처리 중..." : isFollowing ? "언팔로우" : "팔로우"} {/* 율비 */}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
  onRefetch: PropTypes.func,
};

export default FollowButton;
