import produce from "immer";

export const initialState = {
    activeLogs: [],
    loadActiveLogLoading: false,
    loadActiveLogDone: false,
    loadActiveLogError: null,
};

export const LOAD_ACTIVE_LOG_REQUEST = "LOAD_ACTIVE_LOG_REQUEST";
export const LOAD_ACTIVE_LOG_SUCCESS = "LOAD_ACTIVE_LOG_SUCCESS";
export const LOAD_ACTIVE_LOG_FAILURE = "LOAD_ACTIVE_LOG_FAILURE";

const activeLog_JH = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action?.type) {
      case LOAD_ACTIVE_LOG_REQUEST:
        draft.loadActiveLogLoading = true;
        draft.loadActiveLogDone = false;
        draft.loadActiveLogError = null;
        break;
      case LOAD_ACTIVE_LOG_SUCCESS:
        draft.loadActiveLogLoading = false;
        draft.loadActiveLogDone = true;
        draft.activeLogs = action.data;
        break;
      case LOAD_ACTIVE_LOG_FAILURE:
        draft.loadActiveLogLoading = false;
        draft.loadActiveLogError = action.data;
        break;
      default:
        break;
    }
  });

export default activeLog_JH;
