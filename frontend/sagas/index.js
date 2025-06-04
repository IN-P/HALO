import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN'; //인
import user_YG from './user_YG'; //윤기 //asdf

export default function* rootSaga() {
  yield all([
    fork(post_IN), //인
    fork(user_YG), //윤기
    
  ]);
}
