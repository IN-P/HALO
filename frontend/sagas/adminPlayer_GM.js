import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    REGISTER_PLAYER_REQUEST,
    REGISTER_PLAYER_SUCCESS,
    REGISTER_PLAYER_FAILURE,
    UPLOAD_IMAGES_FAILURE,
    UPLOAD_IMAGES_REQUEST,
    UPLOAD_IMAGES_SUCCESS,
} from "../reducers/adminPlayer_GM";

function registerPlayerAPI(data) {
    return axios.post("/store/admin/players", data);
}

function* registerPlayer(action) {
    try {
        yield call(registerPlayerAPI, action.data)
        yield put({type: REGISTER_PLAYER_SUCCESS})
    } catch (err) {
        yield put({type: REGISTER_PLAYER_FAILURE, error: err.response?.data})
    }
}

function uploadImagesAPI(data) {
  return axios.post('/store/admin/players/upload', data);
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
      error: err.response.data,
    });
  }
}

function* watchRegisterPlayer() {
    yield takeLatest(REGISTER_PLAYER_REQUEST, registerPlayer);
}

function* watchUploadImages() {
  yield takeLatest(UPLOAD_IMAGES_REQUEST, uploadImages);
}

export default function* adminPlayerSaga() {
    yield all([
        fork(watchRegisterPlayer),
        fork(watchUploadImages),
    ]);
}