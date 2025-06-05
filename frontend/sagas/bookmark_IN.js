import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';
import {
  BOOKMARK_POST_REQUEST, BOOKMARK_POST_SUCCESS, BOOKMARK_POST_FAILURE,
  UNBOOKMARK_POST_REQUEST, UNBOOKMARK_POST_SUCCESS, UNBOOKMARK_POST_FAILURE
} from '../reducers/bookmark_IN';

function bookmarkPostAPI(postId) {
  return axios.patch(`/post/${postId}/bookmark`);
}
function unbookmarkPostAPI(postId) {
  return axios.delete(`/post/${postId}/bookmark`);
}

function* bookmarkPost(action) {
  try {
    const result = yield call(bookmarkPostAPI, action.data);
    yield put({ type: BOOKMARK_POST_SUCCESS, data: result.data });
    // mainPosts 상태에 BookmarkedUsers 바로 반영하려면 post_IN에서 액션 따로 처리해야 함
  } catch (err) {
    yield put({ type: BOOKMARK_POST_FAILURE, error: err.response?.data || err.message });
  }
}
function* unbookmarkPost(action) {
  try {
    const result = yield call(unbookmarkPostAPI, action.data);
    yield put({ type: UNBOOKMARK_POST_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: UNBOOKMARK_POST_FAILURE, error: err.response?.data || err.message });
  }
}

export default function* bookmarkINSaga() {
  yield all([
    takeLatest(BOOKMARK_POST_REQUEST, bookmarkPost),
    takeLatest(UNBOOKMARK_POST_REQUEST, unbookmarkPost),
  ]);
}
