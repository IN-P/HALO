import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_FEED_REQUEST,
  LOAD_FEED_SUCCESS,
  LOAD_FEED_FAILURE,
  LIKE_FEED_SUCCESS,
  UNLIKE_FEED_SUCCESS,
  BOOKMARK_FEED_SUCCESS,
  UNBOOKMARK_FEED_SUCCESS,
  REGRAM_FEED_SUCCESS,
  REMOVE_FEED_SUCCESS,
} from '../reducers/feed_IN';

function loadFeedAPI(excludePostIds) {
  const query = excludePostIds?.length ? `?excludePostIds=${excludePostIds.join(',')}` : '';
  return axios.get(`/feeds${query}`);
}

function* loadFeed(action) {
  try {
    const result = yield call(loadFeedAPI, action.excludePostIds || []);
    yield put({
      type: LOAD_FEED_SUCCESS,
      data: result.data,
      excludeIds: action.excludePostIds,
    });
  } catch (err) {
    yield put({
      type: LOAD_FEED_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

function* syncFeedUpdate(action) {
  const map = {
    'LIKE_POST_SUCCESS': LIKE_FEED_SUCCESS,
    'UNLIKE_POST_SUCCESS': UNLIKE_FEED_SUCCESS,
    'BOOKMARK_POST_SUCCESS': BOOKMARK_FEED_SUCCESS,
    'UNBOOKMARK_POST_SUCCESS': UNBOOKMARK_FEED_SUCCESS,
    'REGRAM_IN/REGRAM_SUCCESS': REGRAM_FEED_SUCCESS,
    'REMOVE_POST_SUCCESS': REMOVE_FEED_SUCCESS,
  };

  const mapped = map[action.type];
  if (mapped) {
    yield put({ type: mapped, data: action.data });
  }
}

function* watchLoadFeed() {
  yield takeLatest(LOAD_FEED_REQUEST, loadFeed);
}

function* watchFeedSync() {
  yield takeLatest([
    'LIKE_POST_SUCCESS',
    'UNLIKE_POST_SUCCESS',
    'BOOKMARK_POST_SUCCESS',
    'UNBOOKMARK_POST_SUCCESS',
    'REGRAM_IN/REGRAM_SUCCESS',
    'REMOVE_POST_SUCCESS',
  ], syncFeedUpdate);
}

export default function* feedSaga() {
  yield all([
    fork(watchLoadFeed),
    fork(watchFeedSync),
  ]);
}
