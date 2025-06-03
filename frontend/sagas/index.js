import { all } from 'redux-saga/effects';
import chatSaga from './chatSaga'; 

export default function* rootSaga() {
  yield all([
    chatSaga(), 

  ]);
}