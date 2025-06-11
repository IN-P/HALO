import { all, call, delay, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  REPORT_POST_REQUEST,
  REPORT_POST_SUCCESS,
  REPORT_POST_FAILURE,
} from '../reducers/report_YB';

function reportPostAPI(data) {
  return axios.post('/report', data,{ withCredentials: true, });
}

function* reportPost(action) {
  try {
    yield delay(500); // UX를 위해 살짝 딜레이
    const result = yield call(reportPostAPI, action.data);
    yield put({
      type: REPORT_POST_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error('신고 실패:', err);
    yield put({
      type: REPORT_POST_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

export default function* reportSaga() {
  yield all([
    takeLatest(REPORT_POST_REQUEST, reportPost),
  ]);
}
