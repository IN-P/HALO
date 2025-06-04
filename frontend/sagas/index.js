import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN';
import user_y from './user_y'; //윤기추가

export default function* rootSaga() {
  yield all([
    fork(post_IN),
    fork(user_y), //윤기추가
  ]);
}
