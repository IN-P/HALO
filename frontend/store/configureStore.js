import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import rootSaga from '../sagas';
import post_IN from '../reducers/post_IN';
import comment_IN from '../reducers/comment_IN';
import hashtag_IN from '../reducers/hashtag_IN';
import retweet_IN from '../reducers/retweet_IN';
import bookmark_IN from '../reducers/bookmark_IN';
import follow_YB from '../reducers/follow_YB'; 
import report_YB from '../reducers/report_YB';
import user_YG from '../reducers/user_YG'; 
import chatReducer from '../reducers/chatReducer_JW'; 
import profile_jh from '../reducers/profile_jh';
import reportReducer from '../reducers/report_YB';
import block from '../reducers/block'// 율비 추가

const rootReducer = combineReducers({
  post_IN,
  comment_IN, 
  hashtag_IN,
  retweet_IN,
  bookmark_IN,
  follow_YB,
 report_YB: reportReducer,
  block, // 율비
  user_YG, 
  profile_jh,
  chat: chatReducer,
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

