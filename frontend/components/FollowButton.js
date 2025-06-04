import React, { useState, useEffect } from "react";
import axios from 'axios';
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";// 전역 로그인 상태 훅

const FollowButton = ({ toUserId }) => {
  const { user: currentUser } = useAuth(); // 현재 로그인 유저 정보
  const [isFollowing, setIsFollowing] = useState(null); //현재 팔로우상태 초기값
  const [loading, setLoading] = useState(true); //로딩상태

  useEffect(()=>{
    const fetchFollowStatus = async () =>{
      if (!currentUser) return;
      try {
        const res = await axios.get(`http://localhost:3065/follow/check/${toUserId}`,
          {withCredentials: true}
        );
        setIsFollowing(res.data.isFollowing);
      }catch(err){
        console.error("팔로우 상태 확인 실패",err);
        setIsFollowing(false);
      }finally{
        setLoading(false);
      }
    };
    fetchFollowStatus();   
  }, [toUserId, currentUser]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:3065/follow/following/${toUserId}`,{withCredentials: true});
      } else {
        await axios.post(`http://localhost:3065/follow`, { toUserId },{withCredentials: true});
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('팔로우 처리 실패', err.response?.data?.message || err.message);
    }
  };

  if (!currentUser || currentUser.id === toUserId) return null;
  if (loading) return <span>로딩 중...</span>;

  return (
    <button onClick={handleFollow}>
      {isFollowing ? '언팔로우' : '팔로우'}
    </button>
  );
};

FollowButton.propTypes = {
  toUserId: PropTypes.number.isRequired,
};

FollowButton.defaultProps = {
  initialIsFollowing: false,
};

export default FollowButton;
