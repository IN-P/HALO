import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_FAILURE,
  ADD_COMMENT_REQUEST, ADD_COMMENT_SUCCESS, ADD_COMMENT_FAILURE,
} from '../reducers/comment_IN';

// 트리 전체 불러오기
function loadCommentsAPI(postId) {
  return axios.get(`http://localhost:3065/comment/post/${postId}/tree`);
}
function* loadComments(action) {
  try {
    const result = yield call(loadCommentsAPI, action.postId);
    yield put({ type: LOAD_COMMENTS_SUCCESS, data: result.data, postId: action.postId });
  } catch (error) {
    yield put({ type: LOAD_COMMENTS_FAILURE, error: error.response?.data || error.message });
  }
}

// 댓글/대댓글 작성
function addCommentAPI(data) {
  if (data.parentId) {
    return axios.post(`http://localhost:3065/comment/${data.parentId}/reply`, { content: data.content }, { withCredentials: true });
  }
  return axios.post(`http://localhost:3065/comment/post/${data.postId}`, { content: data.content }, { withCredentials: true });
}
function* addComment(action) {
  try {
    yield call(addCommentAPI, action.data);
    // 등록 후 트리 새로고침
    yield put({ type: LOAD_COMMENTS_REQUEST, postId: action.data.postId });
    yield put({ type: ADD_COMMENT_SUCCESS });
  } catch (error) {
    yield put({ type: ADD_COMMENT_FAILURE, error: error.response?.data || error.message });
  }
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}
function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}

export default function* commentSaga() {
  yield all([
    fork(watchLoadComments),
    fork(watchAddComment),
  ]);
}
