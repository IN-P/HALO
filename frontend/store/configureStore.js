import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import rootSaga from '../sagas';
import post_IN from '../reducers/post_IN'; // 인
import comment_IN from '../reducers/comment_IN'; // 인
import bookmark_IN from '../reducers/bookmark_IN';
import user_YG from '../reducers/user_YG'; // 윤기
import chatReducer from '../reducers/chatReducer_JW'; // 재원
import follow_YB from '../reducers/follow_YB'; // 율비 추가
import reportReducer from '../reducers/report_YB';
import profile_jh from '../reducers/profile_jh'; // 준혁

const rootReducer = combineReducers({
  post_IN, // 인
  comment_IN, // 인
  bookmark_IN, // 인
  user_YG, // 윤기
  profile_jh, // 준혁
  chat: chatReducer, // 재원
  // 다른 리듀서들 추가 가능
  follow_YB,
 report_YB: reportReducer,
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

