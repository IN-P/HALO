import React, { useEffect, useState } from "react";
import axios from "axios";

const FollowList = ({ userId, type, onUpdate }) => {
  const [users, setUsers] = useState([]);

  const load = async () => {
    try {
      const endpoint = `http://localhost:3065/follow/${type}`;
      const res = await axios.get(endpoint, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error(`${type} 불러오기 실패`, err);
    }
  };

  useEffect(() => {
    load();
  }, [userId, type]);

  // ✅ 여기! 삭제 후 onUpdate 실행
  const handleRemove = async (targetUserId) => {
    try {
      let url = '';
      if (type === 'followers') {
        url = `http://localhost:3065/follow/follower/${targetUserId}`;
      } else if (type === 'followings') {
        url = `http://localhost:3065/follow/following/${targetUserId}`;
      }

      await axios.delete(url, { withCredentials: true });

      setUsers(prev => prev.filter(user => user.id !== targetUserId));

      // ✅ 마이페이지 갱신 호출
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  return (
    <div>
      <h3>{type === 'followings' ? '팔로잉 목록' : '팔로워 목록'}</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.length === 0 ? (
          <li style={{ color: '#999' }}>표시할 사용자가 없습니다.</li>
        ) : (
          users.map(user => (
            <li key={user.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
              <img
                src={user.profile_img || '/default-profile.png'}
                alt="프로필"
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
              />
              <a
                href={`/profile/${user.nickname}`}
                style={{ flexGrow: 1, textDecoration: 'none', color: '#1890ff', fontWeight: 'bold' }}
              >
                {user.nickname}
              </a>
              <button
                onClick={() => handleRemove(user.id)}
                style={{
                  background: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                {type === 'followers' ? '삭제' : '언팔로우'}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FollowList;
