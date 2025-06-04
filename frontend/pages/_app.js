import React from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css'; // 공통 CSS
import Head from 'next/head';
import { Provider } from 'react-redux';
import wrapper from '../store/configureStore';
import { AuthProvider } from '../hooks/useAuth'; // 율비 추가

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
      <Component {...pageProps} />
      </AuthProvider>
    </Provider>
  );
};

HALO.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
};

export default HALO;
