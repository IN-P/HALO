// frontend/pages/signup.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { SIGN_UP_REQUEST, SIGN_UP_RESET } from '../reducers/user_YG';

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError } = useSelector((state) => state.user_YG);

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();

    if (!email || !nickname || !password || !confirmPassword) {
      return alert('모든 항목을 입력해주세요.');
    }
    if (!email.includes('@')) {
      return alert('올바른 이메일 형식을 입력해주세요.');
    }
    if (password !== confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다.');
    }
    if (!agree) {
      return alert('약관에 동의해주세요.');
    }

    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, nickname, password },
    });
  };

  /// 회원가입 완료 시 초기화
    useEffect(() => {
    dispatch({ type: SIGN_UP_RESET });
  }, [dispatch]);
  
  useEffect(() => {
    if (signUpDone) {
      alert('회원가입 성공');
      dispatch({ type: SIGN_UP_RESET });
      router.push('/login');
    }
  }, [signUpDone]);

  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  return (
    <div className="container">
      <div className="left-panel">
        <h1>Join Us</h1>
        <h2>Halo</h2>
      </div>
      <div className="right-panel">
        <h2>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <label className="agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />{' '}
            약관에 동의합니다
          </label>
          <button type="submit" disabled={signUpLoading}>
            {signUpLoading ? 'Signing up...' : 'Sign up'}
          </button>
        </form>
        <p>
          Already have an Account?{' '}
          <span className="link" onClick={() => router.push('/login')}>
            Login
          </span>
        </p>
      </div>
      <style jsx>{`
        .container {
          background: url('http://localhost:3065/img/view/signup.png') no-repeat center center fixed;
          background-size: cover;
          display: flex;
          height: 100vh;
          justify-content: space-between;
          align-items: center;
          padding: 0 60px;
        }

        .left-panel {
          color: white;
          font-weight: bold;
          font-size: 2.5rem;
        }

        .right-panel {
          background-color: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 16px;
          width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input {
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          padding: 12px;
          background-color: #00C896;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }

        .link {
          color: #007bff;
          cursor: pointer;
          font-weight: 500;
        }

        .agree {
          font-size: 0.9rem;
          text-align: left;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
