import produce from "immer";

export const initialState = {
  data: null,
  loadUserPointLoading: false,
  loadUserPointDone: false,
  loadUserPointError: null,
};

export const LOAD_USER_POINT_REQUEST = "LOAD_USER_POINT_REQUEST";
export const LOAD_USER_POINT_SUCCESS = "LOAD_USER_POINT_SUCCESS";
export const LOAD_USER_POINT_FAILURE = "LOAD_USER_POINT_FAILURE";

const userPoint_JH = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_USER_POINT_REQUEST:
        draft.loadUserPointLoading = true;
        draft.loadUserPointDone = false;
        draft.loadUserPointError = null;
        break;
      case LOAD_USER_POINT_SUCCESS:
        draft.loadUserPointLoading = false;
        draft.loadUserPointDone = true;
        draft.data = action.data;
        break;
      case LOAD_USER_POINT_FAILURE:
        draft.loadUserPointLoading = false;
        draft.statusCode = action.statusCode || null;
        draft.loadUserPointError = action.error || null;
        break;
      default:
        break;
    }
  });

export default userPoint_JH;
