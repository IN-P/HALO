import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  BLOCK_USER_REQUEST, BLOCK_USER_SUCCESS, BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST, UNBLOCK_USER_SUCCESS, UNBLOCK_USER_FAILURE,
  LOAD_BLOCKS_REQUEST, LOAD_BLOCKS_SUCCESS, LOAD_BLOCKS_FAILURE,
} from '../reducers/block';

function blockAPI(toUserId) {
  return axios.post('/block', { toUserId }, { withCredentials: true });
}

function* blockUser(action) {
  try {
    const result = yield call(blockAPI, action.data);
    yield put({ type: BLOCK_USER_SUCCESS, data: result.data.Blocked || result.data });
  } catch (err) {
    yield put({ type: BLOCK_USER_FAILURE, error: err.response?.data || err.message });
  }
}

function unblockAPI(toUserId) {
  return axios.delete(`/block/${toUserId}`, { withCredentials: true });
}

function* unblockUser(action) {
  try {
    yield call(unblockAPI, action.data);
    yield put({ type: UNBLOCK_USER_SUCCESS, data: action.data });
  } catch (err) {
    yield put({ type: UNBLOCK_USER_FAILURE, error: err.response?.data || err.message });
  }
}

function loadBlocksAPI() {
  return axios.get('/block', { withCredentials: true });
}

function* loadBlocks() {
  try {
    const result = yield call(loadBlocksAPI);
    yield put({ type: LOAD_BLOCKS_SUCCESS, data: result.data });
  } catch (err) {
    yield put({ type: LOAD_BLOCKS_FAILURE, error: err.response?.data || err.message });
  }
}

export default function* blockSaga() {
  yield all([
    takeLatest(BLOCK_USER_REQUEST, blockUser),
    takeLatest(UNBLOCK_USER_REQUEST, unblockUser),
    takeLatest(LOAD_BLOCKS_REQUEST, loadBlocks),
  ]);
}
