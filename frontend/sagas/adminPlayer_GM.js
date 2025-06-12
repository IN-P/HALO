import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  REGISTER_PLAYER_REQUEST,
  REGISTER_PLAYER_SUCCESS,
  REGISTER_PLAYER_FAILURE,
  UPLOAD_IMAGES_REQUEST,
  UPLOAD_IMAGES_SUCCESS,
  UPLOAD_IMAGES_FAILURE,
} from "../reducers/adminPlayer_GM";

// 선수 등록 API
function registerPlayerAPI(data) {
  return axios.post("/store/admin/players", data, {
    withCredentials: true, // ✅ 세션 인증 유지
  });
}

function* registerPlayer(action) {
  try {
    yield call(registerPlayerAPI, action.data);
    yield put({ type: REGISTER_PLAYER_SUCCESS });
  } catch (err) {
    yield put({
      type: REGISTER_PLAYER_FAILURE,
      error: err.response?.data || '등록 실패',
    });
  }
}

// 이미지 업로드 API
function uploadImagesAPI(data) {
  return axios.post("/store/admin/players/upload", data, {
    withCredentials: true, // ✅ 인증 유지
  });
}

function* uploadImages(action) {
  try {
    const result = yield call(uploadImagesAPI, action.data);
    yield put({
      type: UPLOAD_IMAGES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    yield put({
      type: UPLOAD_IMAGES_FAILURE,
      error: err.response?.data || '업로드 실패',
    });
  }
}

// watchers
function* watchRegisterPlayer() {
  yield takeLatest(REGISTER_PLAYER_REQUEST, registerPlayer);
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

// root saga
export default function* adminPlayerSaga() {
  yield all([
    fork(watchRegisterPlayer),
    fork(watchUploadImages),
  ]);
}
