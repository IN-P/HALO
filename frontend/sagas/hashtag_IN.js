import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_HASHTAG_POSTS_REQUEST,
  LOAD_HASHTAG_POSTS_SUCCESS,
  LOAD_HASHTAG_POSTS_FAILURE,
} from '../reducers/hashtag_IN';

// API
const loadHashtagPostsAPI = (tag) =>
  axios.get(`http://localhost:3065/post/hashtag/${encodeURIComponent(tag)}`);

// 사가
function* loadHashtagPosts(action) {
  try {
    const result = yield call(loadHashtagPostsAPI, action.data); // data: hashtag string
    yield put({
      type: LOAD_HASHTAG_POSTS_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    yield put({
      type: LOAD_HASHTAG_POSTS_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function* watchLoadHashtagPosts() {
  yield takeLatest(LOAD_HASHTAG_POSTS_REQUEST, loadHashtagPosts);
}

export default function* hashtagINSaga() {
  yield all([fork(watchLoadHashtagPosts)]);
}
