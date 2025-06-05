import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN'; //인
import comment_IN from './comment_IN'; //인
import user_YG from './user_YG'; //윤기
import chatSaga from './chatSaga_JW'; //재원
import bookmark_IN from './bookmark_IN';

export default function* rootSaga() {
  yield all([
    fork(post_IN), //인
    fork(comment_IN), //인
    fork(bookmark_IN), //인
    fork(user_YG), //윤기
    chatSaga(), //재원
  ]);
}
