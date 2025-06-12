import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
  LOAD_PLAYERS_REQUEST, LOAD_PLAYERS_SUCCESS, LOAD_PLAYERS_FAILURE,
  DRAW_PLAYER_REQUEST, DRAW_PLAYER_SUCCESS, DRAW_PLAYER_FAILURE,
  LOAD_DRAW_HISTORY_REQUEST, LOAD_DRAW_HISTORY_SUCCESS, LOAD_DRAW_HISTORY_FAILURE
} from "../reducers/playerDraw_GM";

// API 함수들
const loadPlayersAPI = () =>
  axios.get("/store/draw/players", { withCredentials: true });

const drawPlayerAPI = (data) =>
  axios.post("/store/draw/player-draw", data, { withCredentials: true });

const loadHistoryAPI = () =>
  axios.get("/store/draw/player-draw/history", { withCredentials: true });

// Sagas
function* loadPlayers() {
  try {
    const res = yield call(loadPlayersAPI);
    yield put({ type: LOAD_PLAYERS_SUCCESS, data: res.data });
  } catch (err) {
    yield put({
      type: LOAD_PLAYERS_FAILURE,
      error: err.response?.data?.error || '선수 목록 로딩 실패',
    });
  }
}

function* drawPlayer(action) {
  try {
    const res = yield call(drawPlayerAPI, action.data);
    yield put({ type: DRAW_PLAYER_SUCCESS, data: res.data });
  } catch (err) {
    yield put({
      type: DRAW_PLAYER_FAILURE,
      error: err.response?.data?.error || '뽑기 실패',
    });
  }
}

function* loadHistory() {
  try {
    const res = yield call(loadHistoryAPI);
    yield put({ type: LOAD_DRAW_HISTORY_SUCCESS, data: res.data });
  } catch (err) {
    yield put({
      type: LOAD_DRAW_HISTORY_FAILURE,
      error: err.response?.data?.error || '이력 불러오기 실패',
    });
  }
}

// Watchers
function* watchLoadPlayers() {
  yield takeLatest(LOAD_PLAYERS_REQUEST, loadPlayers);
}
function* watchDrawPlayer() {
  yield takeLatest(DRAW_PLAYER_REQUEST, drawPlayer);
}
function* watchLoadHistory() {
  yield takeLatest(LOAD_DRAW_HISTORY_REQUEST, loadHistory);
}

export default function* playerDrawSaga() {
  yield all([
    fork(watchLoadPlayers),
    fork(watchDrawPlayer),
    fork(watchLoadHistory),
  ]);
}
