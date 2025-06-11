import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  return (
    <Html lang="ko">
      <Head>
        <script
          type="text/javascript"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&libraries=services`}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
