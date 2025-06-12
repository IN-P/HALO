import produce from 'immer';

export const initialState = {
  playerList: [],
  drawResult: null,
  drawHistory: [],

  loadPlayerListLoading: false,
  loadPlayerListDone: false,
  loadPlayerListError: null,

  drawPlayerLoading: false,
  drawPlayerDone: false,
  drawPlayerError: null,

  loadHistoryLoading: false,
  loadHistoryDone: false,
  loadHistoryError: null,
};

// 액션 타입
export const LOAD_PLAYERS_REQUEST = 'LOAD_PLAYERS_REQUEST';
export const LOAD_PLAYERS_SUCCESS = 'LOAD_PLAYERS_SUCCESS';
export const LOAD_PLAYERS_FAILURE = 'LOAD_PLAYERS_FAILURE';

export const DRAW_PLAYER_REQUEST = 'DRAW_PLAYER_REQUEST';
export const DRAW_PLAYER_SUCCESS = 'DRAW_PLAYER_SUCCESS';
export const DRAW_PLAYER_FAILURE = 'DRAW_PLAYER_FAILURE';

export const LOAD_DRAW_HISTORY_REQUEST = 'LOAD_DRAW_HISTORY_REQUEST';
export const LOAD_DRAW_HISTORY_SUCCESS = 'LOAD_DRAW_HISTORY_SUCCESS';
export const LOAD_DRAW_HISTORY_FAILURE = 'LOAD_DRAW_HISTORY_FAILURE';

export const CLEAR_DRAW_RESULT = 'CLEAR_DRAW_RESULT'; // ✅ 추가

const reducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_PLAYERS_REQUEST:
        draft.loadPlayerListLoading = true;
        draft.loadPlayerListDone = false;
        draft.loadPlayerListError = null;
        break;
      case LOAD_PLAYERS_SUCCESS:
        draft.loadPlayerListLoading = false;
        draft.loadPlayerListDone = true;
        draft.playerList = action.data;
        break;
      case LOAD_PLAYERS_FAILURE:
        draft.loadPlayerListLoading = false;
        draft.loadPlayerListError = action.data;
        break;

      case DRAW_PLAYER_REQUEST:
        draft.drawPlayerLoading = true;
        draft.drawPlayerDone = false;
        draft.drawPlayerError = null;
        break;
      case DRAW_PLAYER_SUCCESS:
        draft.drawPlayerLoading = false;
        draft.drawPlayerDone = true;
        draft.drawResult = action.data;
        break;
      case DRAW_PLAYER_FAILURE:
        draft.drawPlayerLoading = false;
        draft.drawPlayerError = action.error;
        break;

      case LOAD_DRAW_HISTORY_REQUEST:
        draft.loadHistoryLoading = true;
        draft.loadHistoryDone = false;
        draft.loadHistoryError = null;
        break;
      case LOAD_DRAW_HISTORY_SUCCESS:
        draft.loadHistoryLoading = false;
        draft.loadHistoryDone = true;
        draft.drawHistory = action.data;
        break;
      case LOAD_DRAW_HISTORY_FAILURE:
        draft.loadHistoryLoading = false;
        draft.loadHistoryError = action.error;
        break;

      case CLEAR_DRAW_RESULT: // ✅ 추가
        draft.drawResult = null;
        break;

      default:
        break;
    }
  });

export default reducer;