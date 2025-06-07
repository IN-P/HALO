import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  RETWEET_REQUEST, RETWEET_SUCCESS, RETWEET_FAILURE,
} from '../reducers/retweet_IN';
import { ADD_POST_SUCCESS } from '../reducers/post_IN';

function retweetAPI(postId) {
  return axios.post(`http://localhost:3065/post/${postId}/retweet`, {}, { withCredentials: true });
}

function* retweet(action) {
  try {
    const result = yield call(retweetAPI, action.data);
    yield put({ type: RETWEET_SUCCESS, data: result.data });
    yield put({ type: ADD_POST_SUCCESS, data: result.data }); 
  } catch (error) {
    yield put({ type: RETWEET_FAILURE, error: error.response?.data || error.message });
  }
}

function* watchRetweet() {
  yield takeLatest(RETWEET_REQUEST, retweet);
}

export default function* retweetINSaga() {
  yield all([fork(watchRetweet)]);
}
