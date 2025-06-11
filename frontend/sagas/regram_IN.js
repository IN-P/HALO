import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import axios from 'axios';
import {
  REGRAM_REQUEST, REGRAM_SUCCESS, REGRAM_FAILURE,
  UNREGRAM_REQUEST, UNREGRAM_SUCCESS, UNREGRAM_FAILURE,
} from '../reducers/regram_IN';

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
  } catch (error) {
    yield put({ type: REGRAM_FAILURE, error: error.response?.data || error.message });
  }
}

function unRegramAPI(postId) {
  return axios.delete(`http://localhost:3065/post/${postId}`, { withCredentials: true });
}
function* unRegram(action) {
  try {
    const result = yield call(unRegramAPI, action.data.regramPostId); // regramPostId
    yield put({ type: UNREGRAM_SUCCESS, data: result.data });
    yield put({ type: 'REMOVE_POST_SUCCESS', data: result.data }); // 메인피드에서 제거
  } catch (error) {
    yield put({ type: UNREGRAM_FAILURE, error: error.response?.data || error.message });
  }
}

function* watchRegram() {
  yield takeLatest(REGRAM_REQUEST, regram);
}
function* watchUnRegram() {
  yield takeLatest(UNREGRAM_REQUEST, unRegram);
}

export default function* regramINSaga() {
  yield all([
    fork(watchRegram),
    fork(watchUnRegram),
  ]);
}
