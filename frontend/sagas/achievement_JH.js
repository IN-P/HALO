import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_ACHIEVEMENT_REQUEST, LOAD_ACHIEVEMENT_SUCCESS, LOAD_ACHIEVEMENT_FAILURE,
} from "../reducers/achievement_JH";

function loadAchievementAPI() {
  return axios.get(`http://localhost:3065/achievements/`);
}

function* loadAchievement(action) {
  try {
    const result = yield call(loadAchievementAPI, action.data);
    console.log("result.data:", result.data);
    yield put({
      type: LOAD_ACHIEVEMENT_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: LOAD_ACHIEVEMENT_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}

function* watchLoadAchievement() {
  yield takeLatest(LOAD_ACHIEVEMENT_REQUEST, loadAchievement);
}

export default function* achievement_JH() {
  yield all([
    fork(watchLoadAchievement),
  ]);
}