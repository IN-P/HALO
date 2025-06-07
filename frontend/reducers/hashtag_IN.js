import produce from 'immer';

// 초기값
export const initialState = {
  posts: [],
  loadHashtagPostsLoading: false,
  loadHashtagPostsDone: false,
  loadHashtagPostsError: null,
};

export const LOAD_HASHTAG_POSTS_REQUEST = 'LOAD_HASHTAG_POSTS_REQUEST';
export const LOAD_HASHTAG_POSTS_SUCCESS = 'LOAD_HASHTAG_POSTS_SUCCESS';
export const LOAD_HASHTAG_POSTS_FAILURE = 'LOAD_HASHTAG_POSTS_FAILURE';

const hashtagINReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_HASHTAG_POSTS_REQUEST:
        draft.loadHashtagPostsLoading = true;
        draft.loadHashtagPostsDone = false;
        draft.loadHashtagPostsError = null;
        break;
      case LOAD_HASHTAG_POSTS_SUCCESS:
        draft.loadHashtagPostsLoading = false;
        draft.loadHashtagPostsDone = true;
        draft.posts = action.data;
        break;
      case LOAD_HASHTAG_POSTS_FAILURE:
        draft.loadHashtagPostsLoading = false;
        draft.loadHashtagPostsError = action.error;
        break;
      default:
        break;
    }
  });

export default hashtagINReducer;
