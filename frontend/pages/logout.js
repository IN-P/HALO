// pages/logout.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { LOG_OUT_REQUEST } from '../reducers/user_YG';
import { useRouter } from 'next/router';

const LogoutPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await dispatch({ type: LOG_OUT_REQUEST });
      router.replace('/login'); //  명확히 로그인 페이지로 이동
    };
    logout();
  }, [dispatch, router]);

  return null;
};

export default LogoutPage;
