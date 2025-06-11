import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_ACTIVE_LOG_REQUEST, LOAD_ACTIVE_LOG_SUCCESS, LOAD_ACTIVE_LOG_FAILURE,
} from "../reducers/activeLog_JH";

function loadActiveLogAPI(userId) {
  return axios.get(`/log/${userId}`);
}

function* loadActiveLog(action) {
  try {
    const result = yield call(loadActiveLogAPI, action.data);
    console.log("result.data:", result.data);
    yield put({
      type: LOAD_ACTIVE_LOG_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: LOAD_ACTIVE_LOG_FAILURE,
      data: error.response.data,
    });
  }
}

function* watchLoadActiveLog() {
  yield takeLatest(LOAD_ACTIVE_LOG_REQUEST, loadActiveLog);
}

export default function* profile_jh() {
  yield all([
    fork(watchLoadActiveLog),
  ]);
}