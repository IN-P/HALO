import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css';
import Head from 'next/head';
import { useDispatch,useSelector  } from 'react-redux';// 율비
import wrapper from '../store/configureStore';

import { AuthProvider } from '../hooks/useAuth'; // 율비 추가
import { LOAD_MY_INFO_REQUEST } from '../reducers/user_YG'; // 윤기
import { LOAD_FOLLOWINGS_REQUEST } from '../reducers/follow_YB'; // 율비
import '../utils/axiosConfig'; // axios 설정

const HALO = ({ Component, pageProps }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user_YG); // ✅ 율비
  useEffect(() => {
    dispatch({ type: LOAD_MY_INFO_REQUEST });
  }, [dispatch]);

    useEffect(() => {
    if (user) {
      dispatch({ type: LOAD_FOLLOWINGS_REQUEST }); // 율비
    }
  }, [user, dispatch]);

  return (
    <AuthProvider>
      <Head>
        <meta charSet="utf-8" />
        <title>HALO SNS</title>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

HALO.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
};

export default wrapper.withRedux(HALO); 
