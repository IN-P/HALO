import produce from 'immer';

// 초기 상태
export const initialState = {
    quizList: [],
    quizDetail: null,
    submitResult: null,

    loadQuizListLoading: false,
    loadQuizListDone: false,
    loadQuizListError: null,

    loadQuizDetailLoading: false,
    loadQuizDetailDone: false,
    loadQuizDetailError: false,

    submitQuizLoading: false,
    submitQuizDone: false,
    submitQuizError: null,
};

// 액션 타입입
export const LOAD_QUIZZES_REQUEST = 'LOAD_QUIZZES_REQUEST';
export const LOAD_QUIZZES_SUCCESS = 'LOAD_QUIZZES_SUCCESS';
export const LOAD_QUIZZES_FAILURE = 'LOAD_QUIZZES_FAILURE';

export const LOAD_QUIZ_DETAIL_REQUEST = 'LOAD_QUIZ_DETAIL_REQUEST';
export const LOAD_QUIZ_DETAIL_SUCCESS = 'LOAD_QUIZ_DETAIL_SUCCESS';
export const LOAD_QUIZ_DETAIL_FAILURE = 'LOAD_QUIZ_DETAIL_FAILURE';

export const SUBMIT_QUIZ_REQUEST = 'SUBMIT_QUIZ_REQUEST';
export const SUBMIT_QUIZ_SUCCESS = 'SUBMIT_QUIZ_SUCCESS';
export const SUBMIT_QUIZ_FAILURE = 'SUBMIT_QUIZ_FAILURE';

// 리듀서
const reducer = (state = initialState, action) =>
    produce(state, (draft) => {
        switch (action.type) {
            case LOAD_QUIZZES_REQUEST:
                draft.loadQuizListLoading = true;
                draft.loadQuizListDone = false;
                draft.loadQuizListError = null;
                break;
            case LOAD_QUIZZES_SUCCESS:
                draft.loadQuizListLoading = false;
                draft.loadQuizListDone = true;
                draft.quizList = action.data;
                break;
            case LOAD_QUIZZES_FAILURE:
                draft.loadQuizListLoading = false;
                draft.loadQuizListError = action.error;
                break;
            
            case LOAD_QUIZ_DETAIL_REQUEST:
                draft.loadQuizDetailLoading = true;
                draft.loadQuizDetailDone = false;
                draft.loadQuizDetailError = null;
                break;
            case LOAD_QUIZ_DETAIL_SUCCESS:
                draft.loadQuizDetailLoading = false;
                draft.loadQuizDetailDone = true;
                draft.quizDetail = action.data;
                break;
            case LOAD_QUIZ_DETAIL_FAILURE:
                draft.loadQuizDetailLoading = false;
                draft.loadQuizDetailError = action.error;
                break;

            case SUBMIT_QUIZ_REQUEST:
                draft.submitQuizLoading = true;
                draft.submitQuizDone = false;
                draft.submitQuizError = null;
                break;
            case SUBMIT_QUIZ_SUCCESS:
                draft.submitQuizLoading = false;
                draft.submitQuizDone = true;
                draft.submitQuizError = action.data;
                break;
            case SUBMIT_QUIZ_FAILURE:
                draft.submitQuizLoading = false;
                draft.submitQuizError = action.error;
                break;
            
            default:
                break;
        }
    });

export default reducer;