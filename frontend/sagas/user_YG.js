import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';
import {
  LOG_IN_REQUEST,
  LOG_IN_SUCCESS,
  LOG_IN_FAILURE,
  LOG_OUT_REQUEST,
  LOG_OUT_SUCCESS,
  LOG_OUT_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_UP_FAILURE,
  LOAD_MY_INFO_REQUEST,
  LOAD_MY_INFO_SUCCESS,
  LOAD_MY_INFO_FAILURE,
  // 준혁
  DELETE_ACCOUNT_REQUEST, DELETE_ACCOUNT_SUCCESS, DELETE_ACCOUNT_FAILURE
} from '../reducers/user_YG';

import { setMe } from '../reducers/chatReducer_JW';
//  로그인
function loginAPI(data) {
  return axios.post('http://localhost:3065/user/login', data, {
    withCredentials: true,
  });
}

function* login(action) {
  try {
    const result = yield call(loginAPI, action.data);
    yield put({
      type: LOG_IN_SUCCESS,
      data: result.data,
    });
    yield put(setMe(result.data)); // 👈 이 줄을 추가!
    console.log('✅ Saga: chatReducer_JW의 me 상태 업데이트 성공:', result.data);
  } catch (err) {
    yield put({
      type: LOG_IN_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

//  로그아웃
function logoutAPI() {
  return axios.post('http://localhost:3065/user/logout', {}, {
    withCredentials: true,
  });
}

function* logout() {
  try {
    yield call(logoutAPI);
    yield put({
      type: LOG_OUT_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: LOG_OUT_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

//  회원가입
function signUpAPI(data) {
  return axios.post('http://localhost:3065/user', data, {
    withCredentials: true,
  });
}

function* signUp(action) {
  try {
    yield call(signUpAPI, action.data);
    yield put({
      type: SIGN_UP_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: SIGN_UP_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

//  내 정보 불러오기
function loadMyInfoAPI() {
  return axios.get('/user/me'); // baseURL + withCredentials 전역 설정 가정
}

function* loadMyInfo() {
  try {
    const result = yield call(loadMyInfoAPI);
    yield put({
      type: LOAD_MY_INFO_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    yield put({
      type: LOAD_MY_INFO_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}

// 준혁 회원탈퇴
function deleteAccountAPI(data) {
  return axios.request({
    method: 'DELETE',
    url: '/user/withdraw',
    data,
    withCredentials: true,
  });
}
function* deleteAccount(action) {
  try{
    const result = yield call(deleteAccountAPI, action.data);
    yield put({
      type: DELETE_ACCOUNT_SUCCESS,
    });
  } catch (err) {
    yield put({
      type: DELETE_ACCOUNT_FAILURE,
      error: err.response?.data || err.message,
    });
  }
}
//

//  Watchers
function* watchLogin() {
  yield takeLatest(LOG_IN_REQUEST, login);
}

function* watchLogout() {
  yield takeLatest(LOG_OUT_REQUEST, logout);
}

function* watchSignUp() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}

function* watchLoadMyInfo() {
  yield takeLatest(LOAD_MY_INFO_REQUEST, loadMyInfo);
}

// 준혁
function* watchDeleteAccount() {
  yield takeLatest(DELETE_ACCOUNT_REQUEST, deleteAccount);
}

//  Root Saga
export default function* userSaga() {
  yield all([
    fork(watchLogin),
    fork(watchLogout),
    fork(watchSignUp),
    fork(watchLoadMyInfo),
    fork(watchDeleteAccount), // 준혁
  ]);
}
