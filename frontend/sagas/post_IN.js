import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE,
  ADD_POST_REQUEST, ADD_POST_SUCCESS, ADD_POST_FAILURE,
  UPLOAD_IMAGES_REQUEST, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE
} from '../reducers/post_IN';

// API 호출 함수

const addPostAPI = (data) => axios.post('http://localhost:3065/post', data, { withCredentials: true });
const uploadImagesAPI = (data) => axios.post('http://localhost:3065/post/images', data, { withCredentials: true });

// 사가 함수들
function loadPostsAPI(lastId = null) {
  return axios.get(`http://localhost:3065/posts?lastId=${lastId || ''}`);
}

function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.lastId);
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: result.data, // { posts, hasMorePosts }
    });
  } catch (error) {
    yield put({
      type: LOAD_POSTS_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({ type: ADD_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: ADD_POST_FAILURE, error: error.response.data });
  }
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({ type: UPLOAD_IMAGES_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: UPLOAD_IMAGES_FAILURE, error: error.response.data });
  }
}

// Watcher
function* watchLoadPosts() {
  yield takeLatest(LOAD_POSTS_REQUEST, loadPosts);
}

function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

// 최상위 Saga
export default function* postINSaga() {
  yield all([
    fork(watchLoadPosts),
    fork(watchAddPost),
    fork(watchUploadImages),
  ]);
}
