import produce from 'immer';

export const initialState = {
    playerRegisterLoading: false,
    playerRegisterDone: false,
    playerRegisterError: null,
}

export const REGISTER_PLAYER_REQUEST = "REGISTER_PLAYER_REQUEST";
export const REGISTER_PLAYER_SUCCESS = "REGISTER_PLAYER_SUCCESS";
export const REGISTER_PLAYER_FAILURE = "REGISTER_PLAYER_FAILURE";

export const RESET_PLAYER_FORM = "RESET_PLAYER_FORM";

const reducer = (state = initialState, action) =>
    produce(state, (draft) => {
        switch (action.type) {
            case REGISTER_PLAYER_REQUEST:
                draft.playerRegisterLoading = true;
                draft.playerRegisterDone = false;
                draft.playerRegisterError = null;
                break;
            case REGISTER_PLAYER_SUCCESS:
                draft.playerRegisterLoading = false;
                draft.playerRegisterDone = true;
                break;
            case REGISTER_PLAYER_FAILURE:
                draft.playerRegisterLoading = false;
                draft.playerRegisterError = action.error;
                break;
            case RESET_PLAYER_FORM:
                draft.playerRegisterDone = false;
                break;
            
            default:
                break;
        }
    });

export default reducer;