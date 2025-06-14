import { all, fork, takeLatest, call, put } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_POSTS_REQUEST, LOAD_POSTS_SUCCESS, LOAD_POSTS_FAILURE,
  ADD_POST_REQUEST, ADD_POST_SUCCESS, ADD_POST_FAILURE,
  UPLOAD_POST_IMAGES_REQUEST, UPLOAD_POST_IMAGES_SUCCESS, UPLOAD_POST_IMAGES_FAILURE,
  LIKE_POST_REQUEST, LIKE_POST_SUCCESS, LIKE_POST_FAILURE,
  UNLIKE_POST_REQUEST, UNLIKE_POST_SUCCESS, UNLIKE_POST_FAILURE,
  REMOVE_POST_REQUEST, REMOVE_POST_SUCCESS, REMOVE_POST_FAILURE,
  EDIT_POST_REQUEST, EDIT_POST_SUCCESS, EDIT_POST_FAILURE,
} from '../reducers/post_IN';

// API 호출 함수들
const addPostAPI = (data) =>
  axios.post('http://localhost:3065/post', data, { withCredentials: true });
const uploadImagesAPI = (data) =>
  axios.post('http://localhost:3065/post/images', data, { withCredentials: true });

function loadPostsAPI(lastId = null) {
  return axios.get(`http://localhost:3065/posts?lastId=${lastId || ''}`);
}

// 사가 함수들
function* loadPosts(action) {
  try {
    const result = yield call(loadPostsAPI, action.lastId);

    // 1️⃣ Mentions 파싱
    const nicknameSet = new Set();
    result.data.posts.forEach((post) => {
      const mentionRegex = /@([^\s@]+)/g;
      let match;
      while ((match = mentionRegex.exec(post.content)) !== null) {
        nicknameSet.add(match[1]);
      }
    });
    const nicknames = Array.from(nicknameSet);

    // 2️⃣ API 호출해서 nickname → user_id 매핑 가져오기
    const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
    const userMap = {};
    response.data.forEach((user) => {
      userMap[user.nickname] = user.id;
    });

    // 3️⃣ postsWithMentions 구성
    const postsWithMentions = result.data.posts.map((post) => {
      const mentionRegex = /@([^\s@]+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(post.content)) !== null) {
        const nickname = match[1];
        mentions.push({
          nickname,
          user_id: userMap[nickname], // 여기서 user_id 채움
        });
      }
      return { ...post, Mentions: mentions };
    });

    // 4️⃣ reducer 로 넘김
    yield put({
      type: LOAD_POSTS_SUCCESS,
      data: {
        posts: postsWithMentions,
        hasMorePosts: result.data.hasMorePosts,
      },
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

    // Mentions 파싱
    const mentionRegex = /@([^\s@]+)/g;
    const nicknameSet = new Set();
    let match;
    while ((match = mentionRegex.exec(result.data.content)) !== null) {
      nicknameSet.add(match[1]);
    }
    const nicknames = Array.from(nicknameSet);

    // nickname → user_id 매핑 API 호출
    let userMap = {};
    if (nicknames.length > 0) {
      const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
      response.data.forEach((user) => {
        userMap[user.nickname] = user.id;
      });
    }

    // Mentions 배열 만들기
    const mentions = [];
    const mentionRegex2 = /@([^\s@]+)/g;
    while ((match = mentionRegex2.exec(result.data.content)) !== null) {
      const nickname = match[1];
      mentions.push({
        nickname,
        user_id: userMap[nickname],
      });
    }

    // reducer 로 넘기기
    yield put({
      type: ADD_POST_SUCCESS,
      data: {
        ...result.data,
        Mentions: mentions,
      },
    });
  } catch (error) {
    yield put({
      type: ADD_POST_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}


function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({ type: UPLOAD_POST_IMAGES_SUCCESS, data: result.data });
  } catch (error) {
    yield put({
      type: UPLOAD_POST_IMAGES_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function likePostAPI(postId) {
  return axios.patch(
    `http://localhost:3065/post/${postId}/like`,
    {},
    { withCredentials: true }
  );
}
function* likePost(action) {
  try {
    const result = yield call(likePostAPI, action.data);
    yield put({ type: LIKE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({
      type: LIKE_POST_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function unlikePostAPI(postId) {
  return axios.delete(
    `http://localhost:3065/post/${postId}/like`,
    { withCredentials: true }
  );
}
function* unlikePost(action) {
  try {
    const result = yield call(unlikePostAPI, action.data);
    yield put({ type: UNLIKE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({
      type: UNLIKE_POST_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function removePostAPI(postId) {
  return axios.delete(
    `http://localhost:3065/post/${postId}`,
    { withCredentials: true }
  );
}
function* removePost(action) {
  try {
    const result = yield call(removePostAPI, action.data);
    yield put({ type: REMOVE_POST_SUCCESS, data: result.data });
  } catch (error) {
    yield put({
      type: REMOVE_POST_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function editPostAPI({ postId, content, images, private_post, location, latitude, longitude }) {
  return axios.patch(
    `http://localhost:3065/post/${postId}`,
    { content, images, private_post, location, latitude, longitude },
    { withCredentials: true }
  );
}
function* editPost(action) {
  try {
    const result = yield call(editPostAPI, action.data);

    // Mentions 파싱
    const mentionRegex = /@([^\s@]+)/g;
    const nicknameSet = new Set();
    let match;
    while ((match = mentionRegex.exec(result.data.content)) !== null) {
      nicknameSet.add(match[1]);
    }
    const nicknames = Array.from(nicknameSet);

    // nickname → user_id 매핑 API 호출
    let userMap = {};
    if (nicknames.length > 0) {
      const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
      response.data.forEach((user) => {
        userMap[user.nickname] = user.id;
      });
    }

    // Mentions 배열 만들기
    const mentions = [];
    const mentionRegex2 = /@([^\s@]+)/g;
    while ((match = mentionRegex2.exec(result.data.content)) !== null) {
      const nickname = match[1];
      mentions.push({
        nickname,
        user_id: userMap[nickname],
      });
    }

    // reducer 로 넘기기
    yield put({
      type: EDIT_POST_SUCCESS,
      data: {
        ...result.data,
        Mentions: mentions,
      },
    });
  } catch (error) {
    yield put({
      type: EDIT_POST_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}


// Watchers
function* watchLoadPosts() {
  yield takeLatest(LOAD_POSTS_REQUEST, loadPosts);
}
function* watchAddPost() {
  yield takeLatest(ADD_POST_REQUEST, addPost);
}
function* watchUploadImages() {
  yield takeLatest(UPLOAD_POST_IMAGES_REQUEST, uploadImages);
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
