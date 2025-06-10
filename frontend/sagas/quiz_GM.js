import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import {
    LOAD_QUIZZES_REQUEST, LOAD_QUIZZES_SUCCESS, LOAD_QUIZZES_FAILURE,
    LOAD_QUIZ_DETAIL_REQUEST, LOAD_QUIZ_DETAIL_SUCCESS, LOAD_QUIZ_DETAIL_FAILURE,
    SUBMIT_QUIZ_REQUEST, SUBMIT_QUIZ_SUCCESS, SUBMIT_QUIZ_FAILURE
} from '../reducers/quiz_GM';

// API
const loadQuizzesAPI = () => axios.get('http://localhost:3065/event/quizzes');
const loadQuizDetailAPI = (id) => axios.get(`/event/quizzes/${id}`);
const submitQuizAPI = ({id, users_id, quizOption_id}) =>
    axios.post(`/event/quizzes/${id}/submit`, {users_id, quizOption_id});

// sagas
// function* loadQuizzes() {
//     try {
//         const result = yield call(loadQuizzesAPI);
//         console.log("🎯 응답받은 퀴즈 목록: ", result.data);
//         yield put({type: LOAD_QUIZZES_SUCCESS, data: result.data});
//     } catch (error) {
//         console.error("❌ 퀴즈 요청 실패: ", error);
//         yield put({type: LOAD_QUIZZES_FAILURE, error: error.response?.data});
//     }
// }
function* loadQuizzes() {
  console.log("🎯 [saga 실행됨] loadQuizzes");

  try {
    const result = yield call(loadQuizzesAPI);
    console.log("🎯 응답받은 퀴즈 목록:", result.data);

    yield put({
      type: LOAD_QUIZZES_SUCCESS,
      data: result.data,
    });
  } catch (err) {
    console.error("❌ 퀴즈 요청 실패:", err);
  }
}

function* loadQuizDetail(action) {
    try {
        const result = yield call(loadQuizDetailAPI, action.data);
        yield put({type: LOAD_QUIZ_DETAIL_SUCCESS, data: result.data});
    } catch (error) {
        yield put({type: LOAD_QUIZ_DETAIL_FAILURE, error: error.response?.data});
    }
}

function* submitQuiz(action) {
    try {
        const result = yield call(submitQuizAPI, action.data);
        yield put({type: SUBMIT_QUIZ_SUCCESS, data: result.data});
    } catch (error) {
        yield put({type: SUBMIT_QUIZ_FAILURE, error: error.response?.data});
    }
}

// Watchers
function* watchLoadQuizzes() {
    yield takeLatest(LOAD_QUIZZES_REQUEST, loadQuizzes);
}
function* watchLoadQuizDetail() {
    yield takeLatest(LOAD_QUIZ_DETAIL_REQUEST, loadQuizDetail);
}
function* watchSubmitQuiz() {
    yield takeLatest(SUBMIT_QUIZ_REQUEST, submitQuiz);
}

// Root saga
export default function* quizSaga() {
    yield all([
        fork(watchLoadQuizzes),
        fork(watchLoadQuizDetail),
        fork(watchSubmitQuiz),
    ]);
}