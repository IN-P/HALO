import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN'; //인
import comment_IN from './comment_IN'; //인
import user_YG from './user_YG'; //윤기
import chatSaga from './chatSaga_JW'; //재원
<<<<<<< HEAD
import followSaga from './follow_YB';//율비
import reportSaga from './report_YB';

=======
import profile_jh from './profile_jh'; //준혁
import bookmark_IN from './bookmark_IN'; //인
>>>>>>> c3bad6c4717ec2a5c99cefa17dade66ebf55a0b6

export default function* rootSaga() {
  yield all([
    fork(post_IN), //인
    fork(comment_IN), //인
    fork(bookmark_IN), //인
    fork(user_YG), //윤기
    fork(profile_jh), //준혁
    chatSaga(), //재원
    followSaga(),//율비
    fork(reportSaga),
  ]);
}
