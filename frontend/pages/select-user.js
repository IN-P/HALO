import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

const SelectUserPage = () => {
  const router = useRouter();
  const { nickname } = router.query;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`/users/${nickname}`);
      setUsers(res.data.users);
    };
    if (nickname) fetch();
  }, [nickname]);

  const handleSelect = (userId) => {
    router.push(`/profile/${nickname}_${userId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>중복된 닉네임이 존재합니다. 본인 계정을 선택해주세요:</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id} onClick={() => handleSelect(u.id)} style={{ cursor: 'pointer', margin: '10px 0' }}>
            <img src={u.profile_img} alt="profile" width="40" height="40" style={{ borderRadius: '50%' }} />
            <span style={{ marginLeft: 10 }}>{u.nickname} (ID: {u.id})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectUserPage;
