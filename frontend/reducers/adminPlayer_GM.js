import produce from 'immer';

export const initialState = {
     imagePaths: [],

    playerRegisterLoading: false,
    playerRegisterDone: false,
    playerRegisterError: null,

    uploadImagesLoading: false,
    uploadImagesDone: false,
    uploadImagesError: null,
}

export const REGISTER_PLAYER_REQUEST = "REGISTER_PLAYER_REQUEST";
export const REGISTER_PLAYER_SUCCESS = "REGISTER_PLAYER_SUCCESS";
export const REGISTER_PLAYER_FAILURE = "REGISTER_PLAYER_FAILURE";

export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';

export const RESET_PLAYER_FORM = "RESET_PLAYER_FORM";

export const REMOVE_IMAGE = "REMOVE_IMAGE";

const reducer = (state = initialState, action) => produce(state, (draft) => {
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
        ///////////////////////////// 선수 이미지 업로드
        case UPLOAD_IMAGES_REQUEST:
            draft.uploadImagesLoading = true;
            draft.uploadImagesDone = false;
            draft.uploadImagesError = null;
            break;
        case UPLOAD_IMAGES_SUCCESS: {
            draft.imagePaths = draft.imagePaths.concat(action.data);
            draft.uploadImagesLoading = false;
            draft.uploadImagesDone = true;
            break;
        }
        case UPLOAD_IMAGES_FAILURE:
            draft.uploadImagesLoading = false;
            draft.uploadImagesError = action.error;
            break;
        case REMOVE_IMAGE:
            draft.imagePaths = draft.imagePaths.filter((v, i) => i !== action.data);
            break;
        default:
            break;
    }
});

export default reducer;