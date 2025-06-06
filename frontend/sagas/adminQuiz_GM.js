import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
    REGISTER_QUIZ_REQUEST, REGISTER_QUIZ_SUCCESS, REGISTER_QUIZ_FAILURE
} from "../reducers/adminQuiz_GM";

// API
const registerQuizAPI = async (data) => {
    const quizRes = await axios.post("/event/admin/quizzes", {
        question: data.question,
        type: data.type,
        point_reward: data.point_reward,
    })

    const quizId = quizRes.data.id

    // 보기들 등록 (OX or 객관식)
    const optionPayloads =
        data.type === "ox"
            ? [
                {question_option: "O", answer: data.correctOX === "O" ? 1 : 0},
                {question_option: "X", answer: data.correctOX === "X" ? 1 : 0},
            ]
            : data.options.map((opt, i) => ({
                question_option: opt,
                answer: i === data.correctIndex ? 1 : 0,
            }))

    for (const opt of optionPayloads) {
        await axios.post("/event/admin/quiz-options", {
            quizzes_id: quizId,
            ...opt,
        })
    }

    return quizRes.data
}

// Saga
function* registerQuiz(action) {
    try {
        yield call(registerQuizAPI, action.data)
        yield put({type: REGISTER_QUIZ_SUCCESS})
    } catch (err) {
        yield put({type: REGISTER_QUIZ_FAILURE, error: err.response?.data})
    }
}

function* watchRegisterQuiz() {
    yield takeLatest(REGISTER_QUIZ_REQUEST, registerQuiz)
}

export default function* adminQuizSaga() {
    yield all([fork(watchRegisterQuiz)])
}