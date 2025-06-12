import produce from "immer";

export const initialState = {
    achievements: [],
    loadAchievementLoading: false,
    loadAchievementDone: false,
    loadAchievementError: null,
};

export const LOAD_ACHIEVEMENT_REQUEST = "LOAD_ACHIEVEMENT_REQUEST";
export const LOAD_ACHIEVEMENT_SUCCESS = "LOAD_ACHIEVEMENT_SUCCESS";
export const LOAD_ACHIEVEMENT_FAILURE = "LOAD_ACHIEVEMENT_FAILURE";

const achievement_JH = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action?.type) {
      case LOAD_ACHIEVEMENT_REQUEST:
        draft.loadAchievementLoading = true;
        draft.loadAchievementDone = false;
        draft.loadAchievementError = null;
        break;
      case LOAD_ACHIEVEMENT_SUCCESS:
        draft.loadAchievementLoading = false;
        draft.loadAchievementDone = true;
        draft.achievements = action.data;
        break;
      case LOAD_ACHIEVEMENT_FAILURE:
        draft.loadAchievementLoading = false;
        draft.loadAchievementError = action.data;
        break;
      default:
        break;
    }
  });

export default achievement_JH;
