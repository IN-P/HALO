import { all, fork, put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";

import {
  LOAD_USER_INFO_REQUEST,
  LOAD_USER_INFO_SUCCESS,
  LOAD_USER_INFO_FAILURE,
} from "../reducers/profile_jh";

// 닉네임 + userId 기반 상세 유저 정보 요청
function loadUserInfoAPI(nickname) {
  return axios.get(`/profile/${nickname}`);
}

function* loadUserInfo(action) {
  try {
    const nickname = action.data; // 처음에는 nickname
    const res = yield call(loadUserInfoAPI, nickname);

    if (res.data.unique && res.data.users.length === 1) {
      const user = res.data.users[0];
      // 상세 정보는 nickname + id를 조합해 호출
      const detailRes = yield call(() => axios.get(`/profile/${user.nickname}/${user.id}`));

      yield put({
        type: LOAD_USER_INFO_SUCCESS,
        data: detailRes.data,
      });
    } else {
      yield put({
        type: LOAD_USER_INFO_FAILURE,
        error: "유저를 찾을 수 없거나 중복됩니다.",
      });
    }
  } catch (error) {
    yield put({
      type: LOAD_USER_INFO_FAILURE,
      error: error.response?.data || error.message,
    });
  }
}

function* watchLoadUserInfo() {
  yield takeLatest(LOAD_USER_INFO_REQUEST, loadUserInfo);
}

export default function* profile_jh() {
  yield all([fork(watchLoadUserInfo)]);
}
