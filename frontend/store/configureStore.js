import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createWrapper } from 'next-redux-wrapper';
import rootSaga from '../sagas';
import post_IN from '../reducers/post_IN'; // 인
import user_YG from '../reducers/user_YG'; // 윤기
import chatReducer from '../reducers/chatReducer_JW'; // 재원

const rootReducer = combineReducers({
  post_IN, // 인
  user_YG, // 윤기
  chat: chatReducer, // 재원
  // 다른 리듀서들 추가 가능
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