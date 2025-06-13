import { all, fork, put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

import {
  LOAD_USER_POINT_REQUEST, LOAD_USER_POINT_SUCCESS, LOAD_USER_POINT_FAILURE,
} from "../reducers/userPoint_JH";

function loadUserInfoAPI(userId) {
  return axios.get(`/point/log/${userId}`);
}

function* LoadUserPoint(action) {
  try {
    const result = yield call(loadUserInfoAPI, action.data);
    yield put({
      type: LOAD_USER_POINT_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_USER_POINT_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

function* watchLoadUserPoint() {
  yield takeLatest(LOAD_USER_POINT_REQUEST, LoadUserPoint);
}

export default function* profile_jh() {
  yield all([fork(watchLoadUserPoint)]);
}
