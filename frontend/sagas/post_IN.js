import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';
import {
  ADD_POST_IN_REQUEST,
  ADD_POST_IN_SUCCESS,
  ADD_POST_IN_FAILURE,
} from './post_IN';

// 글 작성 API 호출 함수
function addPostAPI(data) {
  return axios.post('/post', data);
}

// 글 작성 사가 함수
function* addPost(action) {
  try {
    const result = yield call(addPostAPI, action.data);
    yield put({
      type: ADD_POST_IN_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: ADD_POST_IN_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

// root saga (이후 필요한 사가들을 fork 할 수 있음)
export default function* postInSaga() {
  yield all([
    fork(function* () {
      yield takeLatest(ADD_POST_IN_REQUEST, addPost);
    }),
  ]);
}
