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

  useEffect(() => {
    if (isLogin) {
      router.replace('/');
    }
  }, [isLogin]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return alert('이메일과 비밀번호를 모두 입력해주세요.');
    dispatch({
      type: LOG_IN_REQUEST,
      data: { email, password },
    });
  };

  useEffect(() => {
    if (logInDone) {
      alert('로그인 성공');
      router.push('/');
    }
  }, [logInDone]);

  useEffect(() => {
    if (logInError) alert(logInError);
  }, [logInError]);

  return (
    <div className="container">
      {/* 좌측 상단 Welcome + Halo 로고 */}
      <div className="branding">
        <h1>Welcome</h1>
        <div className="logo-box">
          <img src="/img/logo.png" alt="Halo 로고" />
          <h2>Halo</h2>
        </div>
      </div>

      {/* 로그인 박스 */}
      <div className="login-box">
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
          <button className="google" onClick={() => window.location.href = 'http://localhost:3065/auth/google'}>
            Continue with Google
          </button>
          <button className="kakao" onClick={() => window.location.href = 'http://localhost:3065/auth/kakao'}>
            Continue with Kakao
          </button>
        </div>

        <p className="recovery">
          계정이 복구하실껀가요{' '}
          <span className="link" onClick={() => alert('계정 복구 페이지는 추후 구현 예정')}>
            계정복구
          </span>
        </p>
        <p className="recovery">
          비밀번호를 잊으셨나요?{' '}
          <span
            className="link"
            onClick={() =>
              window.open('/reset-password-popup', '비밀번호 재발급', 'width=500,height=600')
            }
          >
            비밀번호 재발급
          </span>
        </p>
      </div>

      <style jsx>{`
        .container {
          position: relative;
          background: url('http://localhost:3065/img/view/login.png') no-repeat center center fixed;
          background-size: cover;
          height: 100vh;
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .branding {
          position: absolute;
          top: 40px;
          left: 60px;
          color: white;
        }

        .branding h1 {
          font-size: 3rem;
          margin: 0;
          font-weight: bold;
        }

        .logo-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .logo-box img {
          width: 40px;
          height: 40px;
        }

        .logo-box h2 {
          font-size: 1.8rem;
          margin: 0;
        }

        .login-box {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          padding: 40px;
          width: 380px;
          margin-right: 80px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .login-box h2 {
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input {
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }

        button {
          padding: 12px;
          font-size: 1rem;
          background-color: #222;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        button:hover {
          background-color: #333;
        }

        .social {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .google {
          background-color: #4285F4;
        }

        .kakao {
          background-color: #FEE500;
          color: #3c1e1e;
        }

        .recovery {
          color: #c00;
          font-size: 0.9rem;
          margin-top: 10px;
        }

        .link {
          color: #0070f3;
          text-decoration: underline;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .container {
            justify-content: center;
          }

          .branding {
            top: 20px;
            left: 20px;
            font-size: 0.9rem;
          }

          .login-box {
            margin-right: 0;
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
