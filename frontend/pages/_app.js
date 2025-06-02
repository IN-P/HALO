import React from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.css'; // 공통 CSS
import Head from 'next/head';
import { Provider } from 'react-redux';
import wrapper from '../store/configureStore';

const HALO = ({ Component, ...rest }) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;

  return (
    <Provider store={store}>
      <Head>
        <meta charSet="utf-8" />
        <title>HALO SNS</title>
      </Head>
      <Component {...pageProps} />
    </Provider>
  );
};

HALO.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.any.isRequired,
};

export default HALO;
