import produce from 'immer';

export const initialState = {
  comments: {}, // { [postId]: [댓글트리...] }
  loadCommentsDone: {},
  addCommentLoading: false,
  addCommentDone: false,
  addCommentError: null,

  loadCommentsLoading: false,
  loadCommentsError: null,

  editCommentLoading: false,
  editCommentDone: false,
  editCommentError: null,

  removeCommentLoading: false,
  removeCommentDone: false,
  removeCommentError: null,
};

// 액션 타입
export const LOAD_COMMENTS_REQUEST = 'LOAD_COMMENTS_REQUEST';
export const LOAD_COMMENTS_SUCCESS = 'LOAD_COMMENTS_SUCCESS';
export const LOAD_COMMENTS_FAILURE = 'LOAD_COMMENTS_FAILURE';

export const ADD_COMMENT_REQUEST = 'ADD_COMMENT_REQUEST';
export const ADD_COMMENT_SUCCESS = 'ADD_COMMENT_SUCCESS';
export const ADD_COMMENT_FAILURE = 'ADD_COMMENT_FAILURE';

export const EDIT_COMMENT_REQUEST = 'EDIT_COMMENT_REQUEST';
export const EDIT_COMMENT_SUCCESS = 'EDIT_COMMENT_SUCCESS';
export const EDIT_COMMENT_FAILURE = 'EDIT_COMMENT_FAILURE';

export const REMOVE_COMMENT_REQUEST = 'REMOVE_COMMENT_REQUEST';
export const REMOVE_COMMENT_SUCCESS = 'REMOVE_COMMENT_SUCCESS';
export const REMOVE_COMMENT_FAILURE = 'REMOVE_COMMENT_FAILURE';

const reducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_COMMENTS_REQUEST:
        draft.loadCommentsLoading = true;
        draft.loadCommentsError = null;
        draft.loadCommentsDone[action.postId]= false;
        break;
      case LOAD_COMMENTS_SUCCESS:
        draft.loadCommentsLoading = false;
        draft.loadCommentsDone[action.postId] = true;
        draft.comments[action.postId] = action.data;
        break;
      case LOAD_COMMENTS_FAILURE:
        draft.loadCommentsLoading = false;
        draft.loadCommentsError = action.error;
        break;

      case ADD_COMMENT_REQUEST:
        draft.addCommentLoading = true;
        draft.addCommentError = null;
        draft.addCommentDone = false;
        break;
      case ADD_COMMENT_SUCCESS:
        draft.addCommentLoading = false;
        draft.addCommentDone = true;
        break;
      case ADD_COMMENT_FAILURE:
        draft.addCommentLoading = false;
        draft.addCommentError = action.error;
        break;

      case EDIT_COMMENT_REQUEST:
        draft.editCommentLoading = true;
        draft.editCommentError = null;
        draft.editCommentDone = false;
        break;
      case EDIT_COMMENT_SUCCESS:
        draft.editCommentLoading = false;
        draft.editCommentDone = true;
        break;
      case EDIT_COMMENT_FAILURE:
        draft.editCommentLoading = false;
        draft.editCommentError = action.error;
        break;

      case REMOVE_COMMENT_REQUEST:
        draft.removeCommentLoading = true;
        draft.removeCommentError = null;
        draft.removeCommentDone = false;
        break;
      case REMOVE_COMMENT_SUCCESS:
        draft.removeCommentLoading = false;
        draft.removeCommentDone = true;
        break;
      case REMOVE_COMMENT_FAILURE:
        draft.removeCommentLoading = false;
        draft.removeCommentError = action.error;
        break;

      default:
        break;
    }
  });

export default reducer;
