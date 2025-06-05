import { all, fork } from 'redux-saga/effects';
import axios from 'axios';

import post_IN from './post_IN';
import mypage_jh from './mypage_jh';

axios.defaults.baseURL = 'http://localhost:3065';  // 기본요청 url 설정
axios.defaults.withCredentials = true; 

export default function* rootSaga() {
  yield all([
    fork(post_IN),
    fork(mypage_jh),
  ]);
}
