import produce from 'immer';

export const initialState = {
  retweetLoading: false,
  retweetDone: false,
  retweetError: null,
};

export const RETWEET_REQUEST = 'RETWEET_REQUEST';
export const RETWEET_SUCCESS = 'RETWEET_SUCCESS';
export const RETWEET_FAILURE = 'RETWEET_FAILURE';

const retweetINReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case RETWEET_REQUEST:
        draft.retweetLoading = true;
        draft.retweetError = null;
        draft.retweetDone = false;
        break;
      case RETWEET_SUCCESS:
        draft.retweetLoading = false;
        draft.retweetDone = true;
        draft.newRetweet = action.data; // 최근 리트윗 포스트
        break;
      case RETWEET_FAILURE:
        draft.retweetLoading = false;
        draft.retweetError = action.error;
        break;
      default:
        break;
    }
  });

export default retweetINReducer;
