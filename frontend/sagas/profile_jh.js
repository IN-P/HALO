import { all, fork, put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

import {
  LOAD_USER_INFO_REQUEST,
  LOAD_USER_INFO_SUCCESS,
  LOAD_USER_INFO_FAILURE,
} from "../reducers/profile_jh";

function loadUserInfoAPI(userId) {
  return axios.get(`/profile/${userId}`);
}

function* loadUserInfo(action) {
  try {
    const result = yield call(loadUserInfoAPI, action.data);
    yield put({
      type: LOAD_USER_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_USER_INFO_FAILURE,
      error: err.response?.data || err.message,
      statusCode: err.response?.status,
    });
  }
}

function* watchLoadUserInfo() {
  yield takeLatest(LOAD_USER_INFO_REQUEST, loadUserInfo);
}

export default function* profile_jh() {
  yield all([fork(watchLoadUserInfo)]);
}
