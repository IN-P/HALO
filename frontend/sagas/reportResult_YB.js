import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  SUSPEND_USER_REQUEST,
  SUSPEND_USER_SUCCESS,
  SUSPEND_USER_FAILURE,
} from '../reducers/reportResult_YB';

// 🔗 API 호출
function suspendUserAPI(data) {
  return axios.post('http://localhost:3065/report-result', data, { withCredentials: true });

}

// 🌀 사가 함수
function* suspendUser(action) {
  try {
    const res = yield call(suspendUserAPI, action.data);
    yield put({
      type: SUSPEND_USER_SUCCESS,
      data: res.data,
    });
  } catch (err) {
    yield put({
      type: SUSPEND_USER_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

// 📦 루트 사가 등록
export default function* reportResultSaga() {
  yield all([
    takeLatest(SUSPEND_USER_REQUEST, suspendUser),
  ]);
}
