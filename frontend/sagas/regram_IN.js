import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import axios from 'axios';
import {
  REGRAM_REQUEST,
  REGRAM_SUCCESS,
  REGRAM_FAILURE,
} from '../reducers/regram_IN';
import { ADD_POST_SUCCESS } from '../reducers/post_IN';

function regramAPI({ postId, content, isPublic }) {
  return axios.post(
    `http://localhost:3065/post/${postId}/regram`,
    { content, isPublic },
    { withCredentials: true }
  );
}

function* regram(action) {
  try {
    const result = yield call(regramAPI, action.data);
    yield put({ type: REGRAM_SUCCESS, data: result.data });
    yield put({ type: ADD_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: REGRAM_FAILURE, error: error.response?.data || error.message });
  }
}

function* watchRegram() {
  yield takeLatest(REGRAM_REQUEST, regram);
}

export default function* regramINSaga() {
  yield all([fork(watchRegram)]);
}
