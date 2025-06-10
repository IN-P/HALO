import { all, fork, put, takeLatest, call } from 'redux-saga/effects';
import axios from 'axios';

import {
  LOAD_USER_NOTIFICATION_REQUEST, LOAD_USER_NOTIFICATION_SUCCESS, LOAD_USER_NOTIFICATION_FAILURE,
  IS_READ_TRUE_REQUEST, IS_READ_TRUE_SUCCESS, IS_READ_TRUE_FAILURE,
  DELETE_NOTIFICATION_REQUEST, DELETE_NOTIFICATION_SUCCESS, DELETE_NOTIFICATION_FAILURE,
  DELETE_ALL_NOTIFICATION_REQUEST, DELETE_ALL_NOTIFICATION_SUCCESS, DELETE_ALL_NOTIFICATION_FAILURE,
} from "../reducers/notification_JH";

function loadNotificationAPI(userId) {
  return axios.get(`/notification/${userId}`);
}

function* loadNotification(action) {
  try {
    const result = yield call(loadNotificationAPI, action.data);
    console.log("result.data:", result.data);
    yield put({
      type: LOAD_USER_NOTIFICATION_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    yield put({
      type: LOAD_USER_NOTIFICATION_FAILURE,
      data: error.response.data,
    });
  }
}

function isReadTrueAPI(userId) {
  return axios.patch(`/notification/read/${userId}`); 
}
function* isReadTrue(action) {
  try {
    const result = yield call(isReadTrueAPI, action.data);
    yield put({
      type: IS_READ_TRUE_SUCCESS,
      data: result.data,
    });
  } catch (error) {
    yield put({
      type: IS_READ_TRUE_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}

function deleteNotificationAPI({ userId, notificationId }) { return axios.delete(`/notification/delete/${userId}/${notificationId}`); }

function* deleteNotification(action) {
  try {
    const result = yield call(deleteNotificationAPI, action.data);
    yield put({
      type: DELETE_NOTIFICATION_SUCCESS,
      data: result.data,
    });
    yield put({
      type: LOAD_USER_NOTIFICATION_REQUEST,
      data: action.data.userId,
    });
  } catch (error) {
    yield put({
      type: DELETE_NOTIFICATION_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}


function deleteAllNotificationAPI({ userId }) { return axios.delete(`/notification/delete/${userId}/all`); }
function* deleteAllNotification(action) {
  try {
    const result = yield call(deleteAllNotificationAPI, action.data);
    yield put({
      type: DELETE_ALL_NOTIFICATION_SUCCESS,
      data: result.data,
    });
    yield put({
      type: LOAD_USER_NOTIFICATION_REQUEST,
      data: action.data.userId,
    });
  } catch (error) {
    yield put({
      type: DELETE_ALL_NOTIFICATION_FAILURE,
      data: error.response?.data || error.message,
    });
  }
}

function* watchLoadNotification() { yield takeLatest(LOAD_USER_NOTIFICATION_REQUEST, loadNotification); }
function* watchIsReadTrue() { yield takeLatest(IS_READ_TRUE_REQUEST, isReadTrue); }
function* watchDeleteNotification() { yield takeLatest(DELETE_NOTIFICATION_REQUEST, deleteNotification); }
function* watchDeleteAllNotification() { yield takeLatest(DELETE_ALL_NOTIFICATION_REQUEST, deleteAllNotification); }

export default function* notification_JH() {
  yield all([
    fork(watchLoadNotification),
    fork(watchIsReadTrue),
    fork(watchDeleteNotification),
    fork(watchDeleteAllNotification),
  ]);
}