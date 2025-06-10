import produce from 'immer';

export const initialState = {
    quizRegisterLoading: false,
    quizRegisterDone: false,
    quizRegisterError: null,
}

export const REGISTER_QUIZ_REQUEST = "REGISTER_QUIZ_REQUEST";
export const REGISTER_QUIZ_SUCCESS = "REGISTER_QUIZ_SUCCESS";
export const REGISTER_QUIZ_FAILURE = "REGISTER_QUIZ_FAILURE";

export const RESET_QUIZ_FORM = "RESET_QUIZ_FORM";

const reducer = (state = initialState, action) =>
    produce(state, (draft) => {
        switch (action.type) {
            case REGISTER_QUIZ_REQUEST:
                draft.quizRegisterLoading = true;
                draft.quizRegisterDone = false;
                draft.quizRegisterError = null;
                break;
            case REGISTER_QUIZ_SUCCESS:
                draft.quizRegisterLoading = false;
                draft.quizRegisterDone - true;
                break;
            case REGISTER_QUIZ_FAILURE:
                draft.quizRegisterLoading = false;
                draft.quizRegisterError = action.error;
                break;

            default:
                break;
        }
    });

export default reducer;