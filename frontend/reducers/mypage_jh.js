import produce from "immer";

export const initialState = {

  loadUserInfoLoading: false,
  loadUserInfoDone: false,
  loadUserInfoError: null,

};

export const LOAD_USER_INFO_REQUEST = "LOAD_USER_INFO_REQUEST";
export const LOAD_USER_INFO_SUCCESS = "LOAD_USER_INFO_SUCCESS";
export const LOAD_USER_INFO_FAILURE = "LOAD_USER_INFO_FAILURE";

const reducer_jh = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_USER_INFO_REQUEST:
        draft.loadUserInfoLoading = true;
        draft.loadUserInfoError = null;
        draft.loadUserInfoDone = false;
        break;
      case LOAD_USER_INFO_SUCCESS:
        draft.loadUserInfoLoading = false;
        draft.user = action.data;
        draft.loadUserInfoDone = true;
        break;
      case LOAD_USER_INFO_FAILURE:
        draft.loadUserInfoLoading = false;
        draft.loadUserInfoError = action.error;
        break;
    }
  }
);

export default reducer_jh;
