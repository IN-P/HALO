import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css';
import Head from 'next/head';
import { Provider, useDispatch, useStore } from 'react-redux';
import wrapper from '../store/configureStore';

import { AuthProvider } from '../hooks/useAuth'; // 율비 추가

import { LOAD_MY_INFO_REQUEST } from '../reducers/user_YG'; // ✅ 윤기 수정: 리듀서 이름 변경
import '../utils/axiosConfig'; // axios 설정 적용 (가장 먼저 실행)

const AppContent = ({ Component, pageProps }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: LOAD_MY_INFO_REQUEST,
    });
  }, [dispatch]);

  return <Component {...pageProps} />;
};

AppContent.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
}; // 윤기추가 여기까지


const HALO = ({ Component, ...rest }) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;

  return (
    <Provider store={store}>
      <AuthProvider> {/* 율비추가 */}
        <Head>
          <meta charSet="utf-8" />
          <title>HALO SNS</title>
        </Head>
        <AppContent Component={Component} pageProps={pageProps} /> {/* 윤기추가 */}
      </AuthProvider>
    </Provider>
  );
};

HALO.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
};

export default HALO;
