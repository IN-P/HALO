import produce from 'immer';

export const initialState = {
  mainPosts: [],
  imagePaths: [],
  hasMorePosts: true,

  loadPostsLoading: false,
  loadPostsDone: false,
  loadPostsError: null,

  addPostLoading: false,
  addPostDone: false,
  addPostError: null,

  uploadImagesLoading: false,
  uploadImagesDone: false,
  uploadImagesError: null,

  likePostLoading: false,
  likePostDone: false,
  likePostError: null,

  unlikePostLoading: false,
  unlikePostDone: false,
  unlikePostError: null,

  removePostLoading: false,
  removePostDone: false,
  removePostError: null,

  editPostLoading: false,
  editPostDone: false,
  editPostError: null,
};

export const LOAD_POSTS_REQUEST = 'LOAD_POSTS_REQUEST';
export const LOAD_POSTS_SUCCESS = 'LOAD_POSTS_SUCCESS';
export const LOAD_POSTS_FAILURE = 'LOAD_POSTS_FAILURE';

export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';
export const ADD_POST_RESET = 'ADD_POST_RESET';

export const UPLOAD_POST_IMAGES_REQUEST = 'UPLOAD_POST_IMAGES_REQUEST';
export const UPLOAD_POST_IMAGES_SUCCESS = 'UPLOAD_POST_IMAGES_SUCCESS';
export const UPLOAD_POST_IMAGES_FAILURE = 'UPLOAD_POST_IMAGES_FAILURE';

export const LIKE_POST_REQUEST = 'LIKE_POST_REQUEST';
export const LIKE_POST_SUCCESS = 'LIKE_POST_SUCCESS';
export const LIKE_POST_FAILURE = 'LIKE_POST_FAILURE';

export const UNLIKE_POST_REQUEST = 'UNLIKE_POST_REQUEST';
export const UNLIKE_POST_SUCCESS = 'UNLIKE_POST_SUCCESS';
export const UNLIKE_POST_FAILURE = 'UNLIKE_POST_FAILURE';

export const REMOVE_POST_REQUEST = 'REMOVE_POST_REQUEST';
export const REMOVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS';
export const REMOVE_POST_FAILURE = 'REMOVE_POST_FAILURE';

export const EDIT_POST_REQUEST = 'EDIT_POST_REQUEST';
export const EDIT_POST_SUCCESS = 'EDIT_POST_SUCCESS';
export const EDIT_POST_FAILURE = 'EDIT_POST_FAILURE';
export const EDIT_POST_RESET = 'EDIT_POST_RESET';

export const REGRAM_SUCCESS = 'REGRAM_IN/REGRAM_SUCCESS';
export const REGRAM_REQUEST = 'REGRAM_IN/REGRAM_REQUEST';
export const REGRAM_FAILURE = 'REGRAM_IN/REGRAM_FAILURE';
export const REGRAM_RESET   = 'REGRAM_IN/REGRAM_RESET';

export const RESET_IMAGE_PATHS = 'RESET_IMAGE_PATHS';
export const REMOVE_IMAGE = 'REMOVE_IMAGE';
export const UPDATE_COMMENT_COUNT_IN_POST = 'UPDATE_COMMENT_COUNT_IN_POST';

export const BOOKMARK_POST_SUCCESS = 'BOOKMARK_POST_SUCCESS';
export const UNBOOKMARK_POST_SUCCESS = 'UNBOOKMARK_POST_SUCCESS';

const updateBasePostFields = (base, updated) => {
  if (!base || !updated) return;
  base.Likers = updated.Likers ? [...updated.Likers] : [];
  base.Bookmarkers = updated.Bookmarkers ? [...updated.Bookmarkers] : [];
  base.Regrams = updated.Regrams ? [...updated.Regrams] : [];
  if (updated.Images) base.Images = [...updated.Images];
};

const postINReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {

      case LOAD_POSTS_REQUEST:
        draft.loadPostsLoading = true;
        draft.loadPostsError = null;
        draft.loadPostsDone = false;
        break;
      case LOAD_POSTS_SUCCESS:
        draft.loadPostsLoading = false;
        draft.loadPostsDone = true;
        draft.mainPosts = action.lastId
          ? draft.mainPosts.concat(action.data.posts)
          : action.data.posts;
        draft.hasMorePosts = action.data.hasMorePosts;
        break;
      case LOAD_POSTS_FAILURE:
        draft.loadPostsLoading = false;
        draft.loadPostsError = action.error;
        break;

      case ADD_POST_REQUEST:
        draft.addPostLoading = true;
        draft.addPostDone = false;
        draft.addPostError = null;
        break;
      case ADD_POST_SUCCESS:
        draft.addPostLoading = false;
        draft.addPostDone = true;
        draft.mainPosts.unshift(action.data);
        draft.imagePaths = [];
        break;
      case ADD_POST_FAILURE:
        draft.addPostLoading = false;
        draft.addPostError = action.error;
        break;
      case ADD_POST_RESET:
        draft.addPostDone = false;
        break;

      case UPLOAD_POST_IMAGES_REQUEST:
        draft.uploadImagesLoading = true;
        draft.uploadImagesError = null;
        draft.uploadImagesDone = false;
        break;
      case UPLOAD_POST_IMAGES_SUCCESS:
        draft.uploadImagesLoading = false;
        draft.uploadImagesDone = true;
        draft.imagePaths = Array.from(new Set(draft.imagePaths.concat(action.data)));
        break;
      case UPLOAD_POST_IMAGES_FAILURE:
        draft.uploadImagesLoading = false;
        draft.uploadImagesError = action.error;
        break;
      case RESET_IMAGE_PATHS:
        draft.imagePaths = [];
        break;
      case REMOVE_IMAGE:
        draft.imagePaths.splice(action.index, 1);
        break;

      case LIKE_POST_REQUEST:
        draft.likePostLoading = true;
        draft.likePostError = null;
        draft.likePostDone = false;
        break;
      case LIKE_POST_SUCCESS: {
        draft.likePostLoading = false;
        draft.likePostDone = true;
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }
      case LIKE_POST_FAILURE:
        draft.likePostLoading = false;
        draft.likePostError = action.error;
        break;

      case UNLIKE_POST_REQUEST:
        draft.unlikePostLoading = true;
        draft.unlikePostError = null;
        draft.unlikePostDone = false;
        break;
      case UNLIKE_POST_SUCCESS: {
        draft.unlikePostLoading = false;
        draft.unlikePostDone = true;
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }
      case UNLIKE_POST_FAILURE:
        draft.unlikePostLoading = false;
        draft.unlikePostError = action.error;
        break;

      case BOOKMARK_POST_SUCCESS: {
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }
      case UNBOOKMARK_POST_SUCCESS: {
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }

      case REGRAM_REQUEST:
        draft.regramLoading = true;
        draft.regramDone = false;
        draft.regramError = null;
        break;
      case REGRAM_SUCCESS: {
        draft.regramLoading = false;
        draft.regramDone = true;
        if (action.data.fullRegram) {
          draft.mainPosts.unshift(action.data.fullRegram);
        }
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }
      case REGRAM_FAILURE:
        draft.regramLoading = false;
        draft.regramError = action.error;
        break;
      case REGRAM_RESET:
        draft.regramDone = false;
        draft.regramError = null;
        break;

      case REMOVE_POST_REQUEST:
        draft.removePostLoading = true;
        draft.removePostError = null;
        draft.removePostDone = false;
        break;
      case REMOVE_POST_SUCCESS: {
        draft.removePostLoading = false;
        draft.removePostDone = true;
        draft.mainPosts = draft.mainPosts.filter(
          (v) =>
            v.id !== action.data.PostId && // 원본글 제거
            !(action.data.deletedRegramIds && action.data.deletedRegramIds.includes(v.id)) // 리그램글들도 제거
        );
        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainPosts.find((v) => v.id === baseId);
          updateBasePostFields(base, updated);
          draft.mainPosts.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      }
      case REMOVE_POST_FAILURE:
        draft.removePostLoading = false;
        draft.removePostError = action.error;
        break;

      case EDIT_POST_REQUEST:
        draft.editPostLoading = true;
        draft.editPostError = null;
        draft.editPostDone = false;
        break;
      case EDIT_POST_SUCCESS: {
        draft.editPostLoading = false;
        draft.editPostDone = true;
        const post = draft.mainPosts.find((v) => v.id === action.data.PostId);
        if (post) {
          post.content = action.data.content;
          post.Images = action.data.Images;
          post.private_post = action.data.private_post;
        }
        break;
      }
      case EDIT_POST_FAILURE:
        draft.editPostLoading = false;
        draft.editPostError = action.error;
        break;
      case EDIT_POST_RESET:
        draft.editPostDone = false;
        break;

      case UPDATE_COMMENT_COUNT_IN_POST: {
        draft.mainPosts.forEach((p) => {
          if (p.id === action.data.postId) {
            p.Comments = Array(action.data.commentCount).fill({});
          }
          if (p.regram_id === action.data.postId && p.Regram) {
            p.Regram.Comments = Array(action.data.commentCount).fill({});
          }
        });
        break;
      }

      default:
        break;
    }
  });

export default postINReducer;
