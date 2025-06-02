import { all, fork } from 'redux-saga/effects';
import post_IN from './post_IN';

export default function* rootSaga() {
  yield all([
    fork(post_IN),
  ]);
}
