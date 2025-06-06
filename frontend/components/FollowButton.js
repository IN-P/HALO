import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { FOLLOW_REQUEST, UNFOLLOW_REQUEST } from "../reducers/follow_YB";
import { useAuth } from "../hooks/useAuth";

const FollowButton = ({ toUserId }) => {
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
  }, [toUserId, currentUser]);

  if (loading) return null;
  if (!currentUser || currentUser.id === toUserId) return null;

  const handleClick = () => {
    console.log("📤 toUserId 전송:", toUserId);
    if (isFollowing) {
      dispatch({ type: UNFOLLOW_REQUEST, data: toUserId });
      setIsFollowing(false);
    } else {
      dispatch({ type: FOLLOW_REQUEST, data: toUserId });
      setIsFollowing(true);
    }
  };

  return (
    <button onClick={handleClick} disabled={followLoading}>
      {isFollowing ? "언팔로우" : "팔로우"}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
};

export default FollowButton;
