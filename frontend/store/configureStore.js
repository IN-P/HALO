// store.js (수정)
import { createStore, combineReducers, applyMiddleware } from 'redux'; // applyMiddleware 임포트
import { composeWithDevTools } from 'redux-devtools-extension';
import createSagaMiddleware from 'redux-saga'; // redux-saga 임포트
import chatReducer from '../reducers/chatReducer_JW';
import rootSaga from '../sagas'; // rootSaga 임포트 (위에서 새로 만든 파일)

// 루트 리듀서 생성
const rootReducer = combineReducers({
  chat: chatReducer,
});

// Redux Saga 미들웨어 생성
const sagaMiddleware = createSagaMiddleware();

// Redux devtools와 Saga 미들웨어를 함께 적용한 store 생성
const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(sagaMiddleware) // <-- 여기에 Saga 미들웨어 적용
  )
);

// Saga 미들웨어 실행
sagaMiddleware.run(rootSaga); // <-- 여기가 가장 중요해!

export default store;