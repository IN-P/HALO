import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_BADGE_REQUEST, LOAD_BADGE_SUCCESS, LOAD_BADGE_FAILURE,
  ADD_BADGE_REQUEST, ADD_BADGE_SUCCESS, ADD_BADGE_FAILURE,
  SELECT_BADGE_REQUEST, SELECT_BADGE_SUCCESS, SELECT_BADGE_FAILURE,
} from "../reducers/badge_JH";

function loadBadgeAPI() { return axios.get(`/badges`); }
function* loadBadge(action) {
  try {
    const result = yield call(loadBadgeAPI);
    console.log("result.data:", result.data, action);
    yield put({
      type: LOAD_BADGE_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: LOAD_BADGE_FAILURE,
      data: error.response.data,
    });
  }
}

function addBadgeAPI(data) { return axios.post(`/badges`, data); } 
function* addBadge(action) {
  try {
    const result = yield call(addBadgeAPI, action.data); 
    yield put({
      type: ADD_BADGE_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: ADD_BADGE_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}

function selectBadgeAPI(data) { return axios.patch(`badges/${data.userId}/${data.badgeId}/${data.isSelected}`); }
function* selectBadge(action) {
  try {
    const result = yield call(selectBadgeAPI, action.data); 
    yield put({
      type: SELECT_BADGE_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: SELECT_BADGE_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}

function* watchLoadBadge() { yield takeLatest(LOAD_BADGE_REQUEST, loadBadge); }

function* watchAddBadge() { yield takeLatest(ADD_BADGE_REQUEST, addBadge); }

function* watchSelectBadge() { yield takeLatest(SELECT_BADGE_REQUEST, selectBadge); } 


export default function* profile_jh() {
  yield all([
    fork(watchLoadBadge),
    fork(watchAddBadge),
    fork(watchSelectBadge),
  ]);
}