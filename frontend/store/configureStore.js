import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import rootSaga from '../sagas';
import post_IN from '../reducers/post_IN';
import comment_IN from '../reducers/comment_IN';
import hashtag_IN from '../reducers/hashtag_IN';
import regram_IN from '../reducers/regram_IN';
import bookmark_IN from '../reducers/bookmark_IN';
import follow_YB from '../reducers/follow_YB'; 
import report_YB from '../reducers/report_YB';
import user_YG from '../reducers/user_YG'; 
import chatReducer from '../reducers/chatReducer_JW'; 
import profile_jh from '../reducers/profile_jh';
import block from '../reducers/block'
import notification_JH from '../reducers/notification_JH'
import quiz from '../reducers/quiz_GM';
import adminQuiz from '../reducers/adminPlayer_GM';
import adminPlayer from '../reducers/adminPlayer_GM';
import playerDraw from '../reducers/playerDraw_GM'; 
import activeLog_JH from '../reducers/activeLog_JH';
import reportResult_YB  from '../reducers/reportResult_YB';
import badge_JH from '../reducers/badge_JH';
import achievement_JH from '../reducers/achievement_JH';
import userPoint_JH from '../reducers/userPoint_JH';
import mentionUser_JW from '../reducers/mentionUser_JW';
import feed_IN from '../reducers/feed_IN';

const rootReducer = combineReducers({
  post_IN,
  comment_IN, 
  hashtag_IN,
  regram_IN,
  bookmark_IN,
  follow_YB,
  block,
  report_YB,
  user_YG, 
  profile_jh,
  notification_JH,
  chat: chatReducer,
  quiz,
  adminQuiz,
  adminPlayer,
  playerDraw,
  activeLog_JH,
  reportResult_YB,
  badge_JH,
  achievement_JH,
  userPoint_JH,
  mentionUser_JW,
  feed_IN,

});

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [sagaMiddleware];

  const enhancer =
    process.env.NODE_ENV === 'production'
      ? compose(applyMiddleware(...middlewares))
      : composeWithDevTools(applyMiddleware(...middlewares));

  const store = createStore(rootReducer, enhancer);

  store.sagaTask = sagaMiddleware.run(rootSaga);

  return store;
};

export const wrapper = createWrapper(configureStore, {
  debug: process.env.NODE_ENV === 'development',
});

export default wrapper; 

