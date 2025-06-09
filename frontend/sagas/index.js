import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN';
import comment_IN from './comment_IN'; 
import hashtag_IN from './hashtag_IN';
import regram_IN from './regram_IN';
import bookmark_IN from './bookmark_IN'; 
import followSaga from './follow_YB';
import reportSaga from './report_YB';
import blockSaga from './block';
import user_YG from './user_YG'; 
import profile_jh from './profile_jh'; 
import chatSaga from './chatSaga_JW';
import quizSaga from './quiz_GM';
import adminQuizSaga from './adminQuiz_GM';
import playerDrawSaga from './playerDraw_GM';
import adminPlayer from './adminPlayer_GM'

export default function* rootSaga() {
  yield all([
    fork(post_IN),
    fork(comment_IN),
    fork(hashtag_IN),
    fork(regram_IN),
    fork(bookmark_IN),
    fork(followSaga),
    fork(reportSaga),
    fork(blockSaga),
    fork(user_YG),
    fork(profile_jh),
    fork(chatSaga),
    fork(quizSaga),
    fork(adminQuizSaga),
    fork(playerDrawSaga),
    fork(adminPlayer),
  ]);
}