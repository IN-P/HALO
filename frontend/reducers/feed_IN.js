import produce from 'immer';

export const initialState = {
  mainFeeds: [],
  hasMoreFeeds: true,

  loadFeedsLoading: false,
  loadFeedsDone: false,
  loadFeedsError: null,

  likePostLoading: false,
  likePostDone: false,
  likePostError: null,

  unlikePostLoading: false,
  unlikePostDone: false,
  unlikePostError: null,

  removePostLoading: false,
  removePostDone: false,
  removePostError: null,
};

export const LOAD_FEED_REQUEST = 'LOAD_FEED_REQUEST';
export const LOAD_FEED_SUCCESS = 'LOAD_FEED_SUCCESS';
export const LOAD_FEED_FAILURE = 'LOAD_FEED_FAILURE';

export const LIKE_FEED_SUCCESS = 'LIKE_FEED_SUCCESS';
export const UNLIKE_FEED_SUCCESS = 'UNLIKE_FEED_SUCCESS';
export const BOOKMARK_FEED_SUCCESS = 'BOOKMARK_FEED_SUCCESS';
export const UNBOOKMARK_FEED_SUCCESS = 'UNBOOKMARK_FEED_SUCCESS';
export const REGRAM_FEED_SUCCESS = 'REGRAM_FEED_SUCCESS';
export const REMOVE_FEED_SUCCESS = 'REMOVE_FEED_SUCCESS';

export const UPDATE_COMMENT_COUNT_IN_FEED = 'UPDATE_COMMENT_COUNT_IN_FEED';

const updateBasePostFields = (base, updated) => {
  if (!base || !updated) return;
  base.Likers = updated.Likers ? [...updated.Likers] : [];
  base.Bookmarkers = updated.Bookmarkers ? [...updated.Bookmarkers] : [];
  base.Regrams = updated.Regrams ? [...updated.Regrams] : [];
  if (updated.Images) base.Images = [...updated.Images];
};

const feedReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case LOAD_FEED_REQUEST:
        draft.loadFeedsLoading = true;
        draft.loadFeedsDone = false;
        draft.loadFeedsError = null;
        break;

      case LOAD_FEED_SUCCESS:
        draft.loadFeedsLoading = false;
        draft.loadFeedsDone = true;
        draft.mainFeeds = action.excludeIds?.length
          ? draft.mainFeeds.concat(action.data.posts)
          : action.data.posts;
        draft.hasMoreFeeds = action.data.hasMorePosts;
        break;

      case LOAD_FEED_FAILURE:
        draft.loadFeedsLoading = false;
        draft.loadFeedsError = action.error;
        break;

      case LIKE_FEED_SUCCESS:
      case UNLIKE_FEED_SUCCESS:
      case BOOKMARK_FEED_SUCCESS:
      case UNBOOKMARK_FEED_SUCCESS:
      case REMOVE_FEED_SUCCESS:
        draft.mainFeeds = draft.mainFeeds.filter((v) => v.id !== action.data.PostId);

        if (action.data.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainFeeds.find((v) => v.id === baseId);
          if (base) updateBasePostFields(base, updated);
          draft.mainFeeds.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        break;
      case REGRAM_FEED_SUCCESS: {
        if (action.data?.basePost) {
          const updated = action.data.basePost;
          const baseId = updated.id;
          const base = draft.mainFeeds.find((v) => v.id === baseId);
          if (base) updateBasePostFields(base, updated);
          draft.mainFeeds.forEach((v) => {
            if (v.regram_id === baseId && v.Regram) {
              updateBasePostFields(v.Regram, updated);
            }
          });
        }
        if (action.data?.fullRegram) {
          draft.mainFeeds.unshift(action.data.fullRegram);
        }
        break;
      }

      case UPDATE_COMMENT_COUNT_IN_FEED: {
        draft.mainFeeds.forEach((p) => {
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

export default feedReducer;
