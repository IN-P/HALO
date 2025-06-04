import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Context 객체 생성 -전역 로그인 상태 관리
const AuthContext = createContext();

// 2. 모든 컴포넌트를 감싸주는 Provider를 정의.
// 앱 최상단에서 <AuthProvider>로 감싸면 내부 컴포넌트들이 로그인 상태에 접근
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // 로그인 유저 정보
  const [loading, setLoading] = useState(true); // 로딩 여부

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3065/auth/me', {
          withCredentials: true,
        });
        setUser(res.data); // 로그인 유저 정보 저장
      } catch (err) {
        setUser(null); // 비로그인 상태
      } finally {
        setLoading(false); // 로딩 종료
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

// 3. useAuth 훅으로 외부에서 쉽게 접근
export const useAuth = () => useContext(AuthContext);
