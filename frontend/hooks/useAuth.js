import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux'; // ✅ 추가
import { LOAD_FOLLOWINGS_REQUEST } from '../reducers/follow_YB'; // ✅ 추가

// 1. Context 객체 생성 -전역 로그인 상태 관리
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch(); // ✅ dispatch 선언

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3065/user/me', {
          withCredentials: true,
        });
        setUser(res.data);
        dispatch({ type: LOAD_FOLLOWINGS_REQUEST }); // ✅ 로그인된 경우 팔로우 목록 로딩
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
