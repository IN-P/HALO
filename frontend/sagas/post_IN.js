import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE,
  ADD_POST_REQUEST, ADD_POST_SUCCESS, ADD_POST_FAILURE,
  UPLOAD_IMAGES_REQUEST, UPLOAD_IMAGES_SUCCESS, UPLOAD_IMAGES_FAILURE,
  LIKE_POST_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE,
  UNLIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE,
  REMOVE_POST_REQUEST, REMOVE_POST_SUCCESS, REMOVE_POST_FAILURE,
  EDIT_POST_REQUEST, EDIT_POST_SUCCESS, EDIT_POST_FAILURE
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
    yield put({ type: ADD_POST_FAILURE, error: error.response?.data || error.message, });
  }
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({ type: UPLOAD_IMAGES_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: UPLOAD_IMAGES_FAILURE, error: error.response?.data || error.message, });
  }
}

function likePostAPI(postId) {
  return axios.patch(`http://localhost:3065/post/${postId}/like`, {}, { withCredentials: true });
}
function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({ type: LIKE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: LIKE_POST_FAILURE, error: error.response?.data || error.message, });
  }
}

function unlikePostAPI(postId) {
  return axios.delete(`http://localhost:3065/post/${postId}/like`, { withCredentials: true });
}
function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({ type: UNLIKE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: UNLIKE_POST_FAILURE, error: error.response?.data || error.message, });
  }
}

function removePostAPI(postId) {
  return axios.delete(`http://localhost:3065/post/${postId}`, { withCredentials: true });
}
function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    yield put({ type: REMOVE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: REMOVE_POST_FAILURE, error: error.response?.data || error.message });
  }
}

function editPostAPI({ postId, content, images, isPublic }) {
  return axios.patch(`http://localhost:3065/post/${postId}`, { content, images, isPublic }, { withCredentials: true });
}
function* editPost(action) {
  try {
    const result = yield call(editPostAPI, action.data); // data에 images 포함!
    yield put({ type: EDIT_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({ type: EDIT_POST_FAILURE, error: error.response?.data || error.message });
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

function* watchLikePost() {
  yield takeLatest(LIKE_POST_REQUEST, likePost);
}

function* watchUnlikePost() {
  yield takeLatest(UNLIKE_POST_REQUEST, unlikePost);
}

function* watchRemovePost() {
  yield takeLatest(REMOVE_POST_REQUEST, removePost);
}

function* watchEditPost() {
  yield takeLatest(EDIT_POST_REQUEST, editPost);
}

// 최상위 Saga
export default function* postINSaga() {
  yield all([
    fork(watchLoadPosts),
    fork(watchAddPost),
    fork(watchUploadImages),
    fork(watchLikePost),
    fork(watchUnlikePost),
    fork(watchRemovePost),
    fork(watchEditPost),
  ]);
}
