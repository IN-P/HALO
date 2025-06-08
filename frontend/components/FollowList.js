import React, { useEffect, useState } from "react";
import axios from "axios";

const FollowList = ({ userId, type }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:3065/follow/${type}`, {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (err) {
        console.error(`${type}불러오기 실패`, err);
      }
    };
    load();
  }, [userId, type]);

  return (
    <div>
      <h3>{type === 'followings' ? '팔로잉 목록' : '팔로워 목록'}</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.nickname}</li>
        ))}
      </ul>
    </div>
  );
};

export default FollowList;