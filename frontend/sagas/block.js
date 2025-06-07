import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
  BLOCK_USER_REQUEST, BLOCK_USER_SUCCESS, BLOCK_USER_FAILURE,
  UNBLOCK_USER_REQUEST, UNBLOCK_USER_SUCCESS, UNBLOCK_USER_FAILURE,
  LOAD_BLOCKS_REQUEST, LOAD_BLOCKS_SUCCESS, LOAD_BLOCKS_FAILURE,
} from '../reducers/block';

// 율비: 차단 API 호출 함수
function blockAPI(toUserId) {
  return axios.post('/block', { toUserId }, { withCredentials: true });
}

// 율비: 차단 요청 처리 Saga
function* blockUser(action) {
  try {
    const result = yield call(blockAPI, action.data); // 서버에 차단 요청
    yield put({ 
      type: BLOCK_USER_SUCCESS, 
      data: result.data.Blocked || result.data // 율비: 응답에 Blocked 포함 시 대응
    });
  } catch (err) {
    yield put({ 
      type: BLOCK_USER_FAILURE, 
      error: err.response?.data || err.message // 율비: 에러 핸들링
    });
  }
}

// 율비: 차단 해제 API
function unblockAPI(toUserId) {
  return axios.delete(`/block/${toUserId}`, { withCredentials: true });
}

// 율비: 차단 해제 처리 Saga
function* unblockUser(action) {
  try {
    yield call(unblockAPI, action.data); // 서버에 차단 해제 요청
    yield put({ 
      type: UNBLOCK_USER_SUCCESS, 
      data: action.data // 율비: 차단 해제된 유저 ID 전달
    });
  } catch (err) {
    yield put({ 
      type: UNBLOCK_USER_FAILURE, 
      error: err.response?.data || err.message 
    });
  }
}

// 율비: 차단 목록 불러오기 API
function loadBlocksAPI() {
  return axios.get('/block', { withCredentials: true });
}

// 율비: 차단 목록 조회 Saga
function* loadBlocks() {
  try {
    const result = yield call(loadBlocksAPI); // 차단 목록 GET 요청
    yield put({ 
      type: LOAD_BLOCKS_SUCCESS, 
      data: result.data // 율비: 차단 목록 업데이트
    });
  } catch (err) {
    yield put({ 
      type: LOAD_BLOCKS_FAILURE, 
      error: err.response?.data || err.message 
    });
  }
}

// 율비: block 관련 Saga 등록
export default function* blockSaga() {
  yield all([
    takeLatest(BLOCK_USER_REQUEST, blockUser),     // 율비: 차단 요청 감지
    takeLatest(UNBLOCK_USER_REQUEST, unblockUser), // 율비: 차단 해제 요청 감지
    takeLatest(LOAD_BLOCKS_REQUEST, loadBlocks),   // 율비: 차단 목록 불러오기 감지
  ]);
}
