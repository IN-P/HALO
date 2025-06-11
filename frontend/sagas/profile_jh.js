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
    const res = yield call(loadUserInfoAPI, action.data);
    yield put({
      type: LOAD_USER_INFO_SUCCESS,
      data: res.data,
    });
  } catch (error) {
    yield put({
      type: LOAD_USER_INFO_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function* watchLoadUserInfo() {
  yield takeLatest(LOAD_USER_INFO_REQUEST, loadUserInfo);
}

export default function* profile_jh() {
  yield all([fork(watchLoadUserInfo)]);
}
