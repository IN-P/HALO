import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import wrapper from '../store/configureStore';

import { AuthProvider } from '../hooks/useAuth'; // 율비 추가
import { LOAD_MY_INFO_REQUEST } from '../reducers/user_YG'; // 윤기
import '../utils/axiosConfig'; // axios 설정

const HALO = ({ Component, pageProps }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({ type: LOAD_MY_INFO_REQUEST });
  }, [dispatch]);

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
