import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN';
import comment_IN from './comment_IN'; 
import hashtag_IN from './hashtag_IN';
import retweet_IN from './retweet_IN';
import bookmark_IN from './bookmark_IN'; 
import followSaga from './follow_YB';
import reportSaga from './report_YB';
import user_YG from './user_YG'; 
import profile_jh from './profile_jh'; 
import chatSaga from './chatSaga_JW';

export default function* rootSaga() {
  yield all([
    fork(post_IN),
    fork(comment_IN),
    fork(hashtag_IN),
    fork(retweet_IN),
    fork(bookmark_IN),
    fork(followSaga),
    fork(reportSaga),
    fork(user_YG),
    fork(profile_jh),
    fork(chatSaga),
  ]);
}