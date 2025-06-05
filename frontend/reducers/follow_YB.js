// 액션 타입 정의
export const FOLLOW_REQUEST = 'FOLLOW_REQUEST';
export const FOLLOW_SUCCESS = 'FOLLOW_SUCCESS';
export const FOLLOW_FAILURE = 'FOLLOW_FAILURE';

export const UNFOLLOW_REQUEST = 'UNFOLLOW_REQUEST';
export const UNFOLLOW_SUCCESS = 'UNFOLLOW_SUCCESS';
export const UNFOLLOW_FAILURE = 'UNFOLLOW_FAILURE';

export const LOAD_FOLLOWINGS_REQUEST = 'LOAD_FOLLOWINGS_REQUEST';
export const LOAD_FOLLOWINGS_SUCCESS = 'LOAD_FOLLOWINGS_SUCCESS';
export const LOAD_FOLLOWINGS_FAILURE = 'LOAD_FOLLOWINGS_FAILURE';

const initialState = {
  followingList: [],
  followLoading: false,
  followError: null,
};

const followReducer = (state = initialState, action) => {
  switch (action.type) {
    case FOLLOW_REQUEST:
    case UNFOLLOW_REQUEST:
    case LOAD_FOLLOWINGS_REQUEST:
      return {
        ...state,
        followLoading: true,
        followError: null,
      };

    case FOLLOW_SUCCESS:
      return {
        ...state,
        followLoading: false,
        followingList: [...new Set([...state.followingList, action.data])],
      };

    case UNFOLLOW_SUCCESS:
      return {
        ...state,
        followLoading: false,
        followingList: state.followingList.filter(id => id !== action.data),
      };

    case LOAD_FOLLOWINGS_SUCCESS:
      return {
        ...state,
        followLoading: false,
        followingList: action.data.map(user => user.id),
      };

    case FOLLOW_FAILURE:
    case UNFOLLOW_FAILURE:
    case LOAD_FOLLOWINGS_FAILURE:
      return {
        ...state,
        followLoading: false,
        followError: action.error,
      };

    default:
      return state;
  }
};

export default followReducer;
