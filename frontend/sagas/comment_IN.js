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
  return axios.get(`http://localhost:3065/comment/post/${postId}/tree`,{withCredentials: true,});
}
function* loadComments(action) {
  try {
    const result = yield call(loadCommentsAPI, action.postId);

    // Mentions 파싱 준비
    const nicknameSet = new Set();

    // 댓글 트리 순회 (재귀)
    function traverseComments(comments) {
      comments.forEach(comment => {
        const mentionRegex = /@([^\s@]+)/g;
        let match;
        while ((match = mentionRegex.exec(comment.content)) !== null) {
          nicknameSet.add(match[1]);
        }
        if (comment.children && comment.children.length > 0) {
          traverseComments(comment.children);
        }
      });
    }

    traverseComments(result.data);

    // nickname → user_id 매핑
    let userMap = {};
    const nicknames = Array.from(nicknameSet);

    if (nicknames.length > 0) {
      const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
      response.data.forEach((user) => {
        userMap[user.nickname] = user.id;
      });
    }

    // Mentions 추가하기 (재귀)
    function addMentionsToComments(comments) {
      comments.forEach(comment => {
        const mentionRegex = /@([^\s@]+)/g;
        const mentions = [];
        let match;
        while ((match = mentionRegex.exec(comment.content)) !== null) {
          const nickname = match[1];
          mentions.push({
            nickname,
            user_id: userMap[nickname],
          });
        }
        comment.Mentions = mentions;

        if (comment.children && comment.children.length > 0) {
          addMentionsToComments(comment.children);
        }
      });
    }

    addMentionsToComments(result.data);

    // reducer로 넘기기
    yield put({
      type: LOAD_COMMENTS_SUCCESS,
      data: result.data,
      postId: action.postId,
    });
  } catch (error) {
    yield put({
      type: LOAD_COMMENTS_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}


// 댓글/대댓글 작성
function* addComment(action) {
  try {
    const res = yield call(addCommentAPI, action.data);

    // Mentions 파싱
    const mentionRegex = /@([^\s@]+)/g;
    const nicknameSet = new Set();
    let match;
    while ((match = mentionRegex.exec(res.data.content)) !== null) {
      nicknameSet.add(match[1]);
    }

    // nickname → user_id 매핑
    let userMap = {};
    const nicknames = Array.from(nicknameSet);

    if (nicknames.length > 0) {
      const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
      response.data.forEach((user) => {
        userMap[user.nickname] = user.id;
      });
    }

    // Mentions 구성
    const mentions = [];
    const mentionRegex2 = /@([^\s@]+)/g;
    while ((match = mentionRegex2.exec(res.data.content)) !== null) {
      const nickname = match[1];
      mentions.push({
        nickname,
        user_id: userMap[nickname],
      });
    }

    // Mentions를 res.data에 추가 (만약 화면에 직접 써야할 경우 대비용 → 지금은 LOAD_COMMENTS_REQUEST 다시 가니 참고용)
    res.data.Mentions = mentions;

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
function* editComment(action) {
  try {
    const res = yield call(editCommentAPI, action.data);

    // Mentions 파싱
    const mentionRegex = /@([^\s@]+)/g;
    const nicknameSet = new Set();
    let match;
    while ((match = mentionRegex.exec(action.data.content)) !== null) {
      nicknameSet.add(match[1]);
    }

    // nickname → user_id 매핑
    let userMap = {};
    const nicknames = Array.from(nicknameSet);

    if (nicknames.length > 0) {
      const response = yield call(axios.get, `http://localhost:3065/mention/users?q=${encodeURIComponent(nicknames.join(','))}&limit=100`, { withCredentials: true });
      response.data.forEach((user) => {
        userMap[user.nickname] = user.id;
      });
    }

    // Mentions 구성
    const mentions = [];
    const mentionRegex2 = /@([^\s@]+)/g;
    while ((match = mentionRegex2.exec(action.data.content)) !== null) {
      const nickname = match[1];
      mentions.push({
        nickname,
        user_id: userMap[nickname],
      });
    }

    // Mentions를 따로 관리하고 싶으면 res.data 에 Mentions 넣어줄 수 있음
    // res.data.Mentions = mentions; (지금은 사용 X)

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
