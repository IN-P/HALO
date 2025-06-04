import { all } from 'redux-saga/effects';
import chatSaga from './chatSaga_JW'; 

export default function* rootSaga() {
  yield all([
    chatSaga(), 

  ]);
}