import produce from "immer";

export const initialState = {
  data: null,
  statusCode: null,
  loadUserInfoLoading: false,
  loadUserInfoDone: false,
  loadUserInfoError: null,
};

export const LOAD_USER_INFO_REQUEST = "LOAD_USER_INFO_REQUEST";
export const LOAD_USER_INFO_SUCCESS = "LOAD_USER_INFO_SUCCESS";
export const LOAD_USER_INFO_FAILURE = "LOAD_USER_INFO_FAILURE";

const profile_jh = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_USER_INFO_REQUEST:
        draft.loadUserInfoLoading = true;
        draft.loadUserInfoError = null;
        draft.loadUserInfoDone = false;
        break;
      case LOAD_USER_INFO_SUCCESS:
        draft.loadUserInfoLoading = false;
        draft.data = action.data;
        draft.loadUserInfoDone = true;
        break;
      case LOAD_USER_INFO_FAILURE:
        draft.loadUserInfoLoading = false;
        draft.statusCode = action.statusCode || null;
        break;
      default:
        break;
    }
  });

export default profile_jh;
