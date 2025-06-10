import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    LOAD_PLAYERS_REQUEST, LOAD_PLAYERS_SUCCESS, LOAD_PLAYERS_FAILURE,
    DRAW_PLAYER_REQUEST, DRAW_PLAYER_SUCCESS, DRAW_PLAYER_FAILURE,
    LOAD_DRAW_HISTORY_REQUEST, LOAD_DRAW_HISTORY_SUCCESS, LOAD_DRAW_HISTORY_FAILURE
} from "../reducers/playerDraw_GM";

// API
const loadPlayersAPI = () => axios.get("/store/draw/players")
const drawPlayerAPI = () => axios.post("/store/draw/player-draw", data)
const loadHistoryAPI = () => axios.get(`/store/draw/player-draw/history/${userId}`)

// sagas
function* loadPlayers() {
    try {
        const res = yield call(loadPlayersAPI)
        yield put({type: LOAD_PLAYERS_SUCCESS, data: res.data})
    } catch (err) {
        yield put({type: LOAD_PLAYERS_REQUEST, error: err.response?.data})
    }
}

function* drawPlayer(action) {
    try {
        const res = yield call(drawPlayerAPI, action.data)
        yield put({type: DRAW_PLAYER_SUCCESS, data: res.data})
    } catch (err) {
        yield put({type: DRAW_PLAYER_FAILURE, error: err.response?.data})
    }
}

function* loadHistory(action) {
    try {
        const res = yield call(loadHistoryAPI, action.data)
        yield put({type: LOAD_DRAW_HISTORY_SUCCESS, data: res.data})
    } catch (err) {
        yield put({type: LOAD_DRAW_HISTORY_FAILURE, error: err.response?.data})
    }
}

// Watchers
function* watchLoadPlayers() {
    yield takeLatest(LOAD_PLAYERS_REQUEST, loadPlayers)
}
function* watchDrawPlayer() {
    yield takeLatest(DRAW_PLAYER_REQUEST, drawPlayer)
}
function* watchLoadHistory() {
    yield takeLatest(LOAD_DRAW_HISTORY_REQUEST, loadHistory)
}

export default function* playerDrawSaga() {
    yield all([
        fork(watchLoadPlayers),
        fork(watchDrawPlayer),
        fork(watchLoadHistory),
    ])
}