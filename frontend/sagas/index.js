import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN'; //인
import comment_IN from './comment_IN'; //인
import user_YG from './user_YG'; //윤기
import chatSaga from './chatSaga_JW'; //재원
import quizSaga from './quiz_GM';  // 경미
import adminQuizSaga from './adminQuiz_GM';  // 경미
import playerDrawSaga from './playerDraw_GM';  // 경미

export default function* rootSaga() {
  yield all([
    fork(post_IN), //인
    fork(comment_IN), //인
    fork(user_YG), //윤기
    chatSaga(), //재원
    fork(quizSaga),  // 경미
    fork(adminQuizSaga),  // 경미
    fork(playerDrawSaga),  // 경미
  ]);
}
