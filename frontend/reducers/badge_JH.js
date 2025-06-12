import produce from "immer";

export const initialState = {
  badges: [],
  loadBadgeLoading: false,
  loadBadgeDone: false,
  loadBadgeError: null,

  addBadgeLoading: false,
  addBadgeDone: false,
  addBadgeError: null,

  selectBadgeLoading: false,
  selectBadgeDone: false,
  selectBadgeError: null,
};

export const LOAD_BADGE_REQUEST = "LOAD_BADGE_REQUEST";
export const LOAD_BADGE_SUCCESS = "LOAD_BADGE_SUCCESS";
export const LOAD_BADGE_FAILURE = "LOAD_BADGE_FAILURE";

export const ADD_BADGE_REQUEST = "ADD_BADGE_REQUEST";
export const ADD_BADGE_SUCCESS = "ADD_BADGE_SUCCESS";
export const ADD_BADGE_FAILURE = "ADD_BADGE_FAILURE";

export const SELECT_BADGE_REQUEST = "SELECT_BADGE_REQUEST";
export const SELECT_BADGE_SUCCESS = "SELECT_BADGE_SUCCESS";
export const SELECT_BADGE_FAILURE = "SELECT_BADGE_FAILURE";

const badge_JH = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action?.type) {
      case LOAD_BADGE_REQUEST:
        draft.loadBadgeLoading = true;
        draft.loadBadgeDone = false;
        draft.loadBadgeError = null;
        break;
      case LOAD_BADGE_SUCCESS:
        draft.loadBadgeLoading = false;
        draft.loadBadgeDone = true;
        draft.badges = action.data;
        break;
      case LOAD_BADGE_FAILURE:
        draft.loadBadgeLoading = false;
        draft.loadBadgeError = action.data;
        break;
      case ADD_BADGE_REQUEST:
        draft.addBadgeLoading = true;
        draft.addBadgeDone = false;
        draft.addBadgeError = null;
        break;
      case ADD_BADGE_SUCCESS:
        draft.addBadgeLoading = false;
        draft.addBadgeDone = true;
        draft.badges = action.data;
        break;
      case ADD_BADGE_FAILURE:
        draft.addBadgeLoading = false;
        draft.addBadgeError = action.data;
        break;
      case SELECT_BADGE_REQUEST:
        draft.selectBadgeLoading = true;
        draft.selectBadgeDone = false;
        draft.selectBadgeError = null;
        break;
      case SELECT_BADGE_SUCCESS:
        draft.selectBadgeLoading = false;
        draft.selectBadgeDone = true;
        draft.UserBadges = action.data;
        break;
      case SELECT_BADGE_FAILURE:
        draft.selectBadgeLoading = false;
        draft.UserBadges = action.data;
        break;
      default:
        break;
    }
  });

export default badge_JH;
