// frontend/pages/signup.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { SIGN_UP_REQUEST } from '../reducers/user_y';

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError } = useSelector((state) => state.user_y);

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

  // 회원가입 성공 시
  useEffect(() => {
    if (signUpDone) {
      alert('회원가입 성공');
      router.push('/login');
    }
  }, [signUpDone]);

  // 에러 처리
  useEffect(() => {
    if (signUpError) {
      alert(signUpError);
    }
  }, [signUpError]);

  return (
    <div className="container">
      <div className="left">
        <h1>Join Us</h1>
        <h2>Halo</h2>
      </div>
      <div className="right">
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
          <label>
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
          display: flex;
          height: 100vh;
        }
        .left {
          flex: 1;
          background: url('/baseball-signup.png') center/cover no-repeat;
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
        input,
        label {
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
        .link {
          color: blue;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;
