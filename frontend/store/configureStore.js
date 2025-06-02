import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { combineReducers } from 'redux';
import chatReducer from '../reducers/chatReducer';

// 루트 리듀서 생성
const rootReducer = combineReducers({
  chat: chatReducer,
});

// Redux devtools 적용된 store 생성
const store = createStore(rootReducer, composeWithDevTools());

export default store;