import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_FAILURE,
  ADD_COMMENT_REQUEST, ADD_COMMENT_SUCCESS, ADD_COMMENT_FAILURE,
  EDIT_COMMENT_REQUEST, EDIT_COMMENT_SUCCESS, EDIT_COMMENT_FAILURE,
  REMOVE_COMMENT_REQUEST, REMOVE_COMMENT_SUCCESS, REMOVE_COMMENT_FAILURE,
} from '../reducers/comment_IN';
import { UPDATE_COMMENT_COUNT_IN_POST } from '../reducers/post_IN';

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
    const res = yield call(addCommentAPI, action.data);
    yield put({ type: LOAD_COMMENTS_REQUEST, postId: action.data.postId });
    yield put({ 
      type: UPDATE_COMMENT_COUNT_IN_POST, 
      data: { postId: res.data.postId, commentCount: res.data.commentCount } 
    });
    yield put({ type: ADD_COMMENT_SUCCESS });
  } catch (error) {
    yield put({ type: ADD_COMMENT_FAILURE, error: error.response?.data || error.message });
  }
}

// 댓글 수정
function editCommentAPI(data) {
  return axios.patch(`http://localhost:3065/comment/${data.commentId}`, { content: data.content }, { withCredentials: true });
}
function* editComment(action) {
  try {
    yield call(editCommentAPI, action.data);
    // 수정 후 트리 새로고침
    yield put({ type: LOAD_COMMENTS_REQUEST, postId: action.data.postId });
    yield put({ type: EDIT_COMMENT_SUCCESS });
  } catch (error) {
    yield put({ type: EDIT_COMMENT_FAILURE, error: error.response?.data || error.message });
  }
}

// 댓글 삭제
function removeCommentAPI(id) {
  return axios.delete(`http://localhost:3065/comment/${id}`, { withCredentials: true });
}
function* removeComment(action) {
  try {
    const res = yield call(removeCommentAPI, action.data.commentId);
    yield put({ type: LOAD_COMMENTS_REQUEST, postId: action.data.postId });
    yield put({ 
      type: UPDATE_COMMENT_COUNT_IN_POST, 
      data: { postId: res.data.postId, commentCount: res.data.commentCount } 
    });
    yield put({ type: REMOVE_COMMENT_SUCCESS });
  } catch (error) {
    yield put({ type: REMOVE_COMMENT_FAILURE, error: error.response?.data || error.message });
  }
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadComments);
}
function* watchAddComment() {
  yield takeLatest(ADD_COMMENT_REQUEST, addComment);
}
function* watchEditComment() {
  yield takeLatest(EDIT_COMMENT_REQUEST, editComment);
}
function* watchRemoveComment() {
  yield takeLatest(REMOVE_COMMENT_REQUEST, removeComment);
}

export default function* commentSaga() {
  yield all([
    fork(watchLoadComments),
    fork(watchAddComment),
    fork(watchEditComment),
    fork(watchRemoveComment),
  ]);
}
