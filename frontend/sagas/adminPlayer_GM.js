import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    REGISTER_PLAYER_REQUEST, REGISTER_PLAYER_SUCCESS, REGISTER_PLAYER_FAILURE
} from "../reducers/adminPlayer_GM";

function registerPlayerAPI(data) {
    return axios.post("/store/admin/players", data)
}

function* registerPlayer(action) {
    try {
        yield call(registerPlayerAPI, action.data)
        yield put({type: REGISTER_PLAYER_SUCCESS})
    } catch (err) {
        yield put({ype: REGISTER_PLAYER_FAILURE, error: err.response?.data})
    }
}

function* watchRegisterPlayer() {
    yield takeLatest(REGISTER_PLAYER_REQUEST, registerPlayer)
}

export default function* adminPlayerSaga() {
    yield all([fork(watchRegisterPlayer)])
}