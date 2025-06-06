// frontend/sagas/block.js

import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';
import {
  BLOCK_USER_REQUEST,
  BLOCK_USER_SUCCESS,
  BLOCK_USER_FAILURE,
} from '../reducers/block';

function blockUserAPI(toUserId) {
  return axios.post('/block', { toUserId }, { withCredentials: true });
}

function* blockUser(action) {
  try {
    yield call(blockUserAPI, action.data);
    yield put({ type: BLOCK_USER_SUCCESS });
  } catch (err) {
    yield put({
      type: BLOCK_USER_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

function* watchBlockUser() {
  yield takeLatest(BLOCK_USER_REQUEST, blockUser);
}

export default function* blockSaga() {
  yield all([fork(watchBlockUser)]);
}
