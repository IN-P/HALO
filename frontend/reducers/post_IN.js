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
};

// 액션 타입
export const LOAD_POSTS_REQUEST = 'LOAD_POSTS_REQUEST';
export const LOAD_POSTS_SUCCESS = 'LOAD_POSTS_SUCCESS';
export const LOAD_POSTS_FAILURE = 'LOAD_POSTS_FAILURE';

export const ADD_POST_REQUEST = 'ADD_POST_REQUEST';
export const ADD_POST_SUCCESS = 'ADD_POST_SUCCESS';
export const ADD_POST_FAILURE = 'ADD_POST_FAILURE';

export const UPLOAD_IMAGES_REQUEST = 'UPLOAD_IMAGES_REQUEST';
export const UPLOAD_IMAGES_SUCCESS = 'UPLOAD_IMAGES_SUCCESS';
export const UPLOAD_IMAGES_FAILURE = 'UPLOAD_IMAGES_FAILURE';

export const REMOVE_IMAGE = 'REMOVE_IMAGE'; 

// 리듀서
const postINReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_POSTS_REQUEST:
        draft.loadPostsLoading = true;
        draft.loadPostsError = null;
        break;
      case LOAD_POSTS_SUCCESS:
        draft.loadPostsLoading = false;
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

      case UPLOAD_IMAGES_REQUEST:
        draft.uploadImagesLoading = true;
        draft.uploadImagesError = null;
        break;
      case UPLOAD_IMAGES_SUCCESS:
        draft.uploadImagesLoading = false;
        draft.uploadImagesDone = true;
        draft.imagePaths = draft.imagePaths.concat(action.data);
        break;
      case UPLOAD_IMAGES_FAILURE:
        draft.uploadImagesLoading = false;
        draft.uploadImagesError = action.error;
        break;

      // ✅ 이미지 리무버 추가
      case REMOVE_IMAGE:
        draft.imagePaths.splice(action.index, 1);
        break;

      default:
        break;
    }
  });

export default postINReducer;
