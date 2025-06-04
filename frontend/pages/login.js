// frontend/pages/login.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { LOG_IN_REQUEST } from '../reducers/user_YG';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { logInLoading, logInError, logInDone, isLogin } = useSelector((state) => state.user_YG);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //  이미 로그인된 상태면 메인으로 리다이렉트
  useEffect(() => {
    if (isLogin) {
      router.replace('/');
    }
  }, [isLogin]);

  // 로그인 요청
  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      return alert('이메일과 비밀번호를 모두 입력해주세요.');
    }
    dispatch({
      type: LOG_IN_REQUEST,
      data: { email, password },
    });
  };

  // 로그인 성공 시 이동
  useEffect(() => {
    if (logInDone) {
      alert('로그인 성공');
      router.push('/');
    }
  }, [logInDone]);

  // 로그인 실패 시 에러 표시
  useEffect(() => {
    if (logInError) {
      alert(logInError);
    }
  }, [logInError]);

  return (
    <div className="container">
      <div className="left">
        <h1>Welcome</h1>
        <h2>Halo</h2>
      </div>
      <div className="right">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={logInLoading}>
            {logInLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>
          Don’t have an account?{' '}
          <span className="link" onClick={() => router.push('/signup')}>
            Sign up
          </span>
        </p>
        <div className="social">
          <button disabled>Continue with Google</button>
          <button disabled>Continue with Google</button>
        </div>
        <p className="recovery">
          계정이 복구하실껀가요{' '}
          <span className="link" onClick={() => alert('계정 복구 페이지는 추후 구현 예정')}>
            계정복구
          </span>
        </p>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          height: 100vh;
        }
        .left {
          flex: 1;
          background: url('/baseball-login.png') center/cover no-repeat;
          padding: 50px;
          color: white;
        }
        .right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        input {
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }
        button {
          padding: 10px;
          background-color: #4A7EFF;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .social {
          margin-top: 10px;
          display: flex;
          gap: 10px;
        }
        .recovery {
          color: red;
          margin-top: 10px;
        }
        .link {
          color: blue;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
