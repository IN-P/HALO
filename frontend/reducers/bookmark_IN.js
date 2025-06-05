export const BOOKMARK_POST_REQUEST = 'BOOKMARK_POST_REQUEST';
export const BOOKMARK_POST_SUCCESS = 'BOOKMARK_POST_SUCCESS';
export const BOOKMARK_POST_FAILURE = 'BOOKMARK_POST_FAILURE';
export const UNBOOKMARK_POST_REQUEST = 'UNBOOKMARK_POST_REQUEST';
export const UNBOOKMARK_POST_SUCCESS = 'UNBOOKMARK_POST_SUCCESS';
export const UNBOOKMARK_POST_FAILURE = 'UNBOOKMARK_POST_FAILURE';

const initialState = {
  bookmarkPostLoading: false,
  bookmarkPostDone: false,
  bookmarkPostError: null,
  unbookmarkPostLoading: false,
  unbookmarkPostDone: false,
  unbookmarkPostError: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case BOOKMARK_POST_REQUEST:
      return {
        ...state,
        bookmarkPostLoading: true,
        bookmarkPostDone: false,
        bookmarkPostError: null,
      };
    case BOOKMARK_POST_SUCCESS:
      return {
        ...state,
        bookmarkPostLoading: false,
        bookmarkPostDone: true,
      };
    case BOOKMARK_POST_FAILURE:
      return {
        ...state,
        bookmarkPostLoading: false,
        bookmarkPostError: action.error,
      };
    case UNBOOKMARK_POST_REQUEST:
      return {
        ...state,
        unbookmarkPostLoading: true,
        unbookmarkPostDone: false,
        unbookmarkPostError: null,
      };
    case UNBOOKMARK_POST_SUCCESS:
      return {
        ...state,
        unbookmarkPostLoading: false,
        unbookmarkPostDone: true,
      };
    case UNBOOKMARK_POST_FAILURE:
      return {
        ...state,
        unbookmarkPostLoading: false,
        unbookmarkPostError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
