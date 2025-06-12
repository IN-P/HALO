import produce from 'immer';

export const REGRAM_REQUEST = 'REGRAM_IN/REGRAM_REQUEST';
export const REGRAM_SUCCESS = 'REGRAM_IN/REGRAM_SUCCESS';
export const REGRAM_FAILURE = 'REGRAM_IN/REGRAM_FAILURE';
export const REGRAM_RESET   = 'REGRAM_IN/REGRAM_RESET';

export const UNREGRAM_REQUEST = 'REGRAM_IN/UNREGRAM_REQUEST';
export const UNREGRAM_SUCCESS = 'REGRAM_IN/UNREGRAM_SUCCESS';
export const UNREGRAM_FAILURE = 'REGRAM_IN/UNREGRAM_FAILURE';

export const initialState = {
  regramLoading: false,
  regramDone: false,
  regramError: null,
  regramPost: null,
};

const regramINReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case REGRAM_REQUEST:
        draft.regramLoading = true;
        draft.regramDone = false;
        draft.regramError = null;
        break;
      case REGRAM_SUCCESS:
        draft.regramLoading = false;
        draft.regramDone = true;
        draft.regramPost = action.data;
        break;
      case REGRAM_FAILURE:
        draft.regramLoading = false;
        draft.regramError = action.error;
        break;
      case REGRAM_RESET:
        draft.regramDone = false;
        draft.regramError = null;
        draft.regramPost = null;
        break;

      case UNREGRAM_REQUEST:
        draft.regramLoading = true;
        draft.regramDone = false;
        draft.regramError = null;
        break;
      case UNREGRAM_SUCCESS:
        draft.regramLoading = false;
        draft.regramDone = true;
        draft.regramPost = null;
        break;
      case UNREGRAM_FAILURE:
        draft.regramLoading = false;
        draft.regramError = action.error;
        break;        
        
      default:
        break;
    }
  });

export default regramINReducer;

