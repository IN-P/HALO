import { takeLatest, call, put, all, fork } from 'redux-saga/effects';
import axios from 'axios';
import {
  FOLLOW_REQUEST, FOLLOW_SUCCESS, FOLLOW_FAILURE,
  UNFOLLOW_REQUEST, UNFOLLOW_SUCCESS, UNFOLLOW_FAILURE,
  LOAD_FOLLOWINGS_REQUEST, LOAD_FOLLOWINGS_SUCCESS, LOAD_FOLLOWINGS_FAILURE
} from '../reducers/follow_YB';

// ✅ API
function followAPI(toUserId) {
  return axios.post(`/follow`, { toUserId }, { withCredentials: true });
}
function unfollowAPI(toUserId) {
  return axios.delete(`following/${toUserId}`, { withCredentials: true });
}
function loadFollowingsAPI() {
  return axios.get('/followings', { withCredentials: true });
}

// ✅ Saga
function* follow(action) {
  try {
    yield call(followAPI, action.data);
    yield put({ type: FOLLOW_SUCCESS, data: action.data });
  } catch (err) {
    yield put({ type: FOLLOW_FAILURE, error: err.response?.data || err.message });
  }
}

function* unfollow(action) {
  try {
    yield call(unfollowAPI, action.data);
    yield put({ type: UNFOLLOW_SUCCESS, data: action.data });
  } catch (err) {
    yield put({ type: UNFOLLOW_FAILURE, error: err.response?.data || err.message });
  }
}

function* loadFollowings() {
  try {
    const result = yield call(loadFollowingsAPI);
    yield put({ type: LOAD_FOLLOWINGS_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: LOAD_FOLLOWINGS_FAILURE, error: err.response?.data || err.message });
  }
}

// ✅ Watcher
function* watchFollow() {
  yield takeLatest(FOLLOW_REQUEST, follow);
}
function* watchUnfollow() {
  yield takeLatest(UNFOLLOW_REQUEST, unfollow);
}
function* watchLoadFollowings() {
  yield takeLatest(LOAD_FOLLOWINGS_REQUEST, loadFollowings);
}

export default function* followSaga() {
  yield all([
    fork(watchFollow),
    fork(watchUnfollow),
    fork(watchLoadFollowings),
  ]);
}
