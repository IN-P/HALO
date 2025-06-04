export const initialState = {
  mainPosts: [],
  addPostLoading: false,
  addPostDone: false,
  addPostError: null,
};

export const ADD_POST_IN_REQUEST = 'ADD_POST_IN_REQUEST';
export const ADD_POST_IN_SUCCESS = 'ADD_POST_IN_SUCCESS';
export const ADD_POST_IN_FAILURE = 'ADD_POST_IN_FAILURE';

const postINReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_POST_IN_REQUEST:
      return {
        ...state,
        addPostLoading: true,
        addPostDone: false,
        addPostError: null,
      };
    case ADD_POST_IN_SUCCESS:
      return {
        ...state,
        addPostLoading: false,
        addPostDone: true,
        mainPosts: [action.data, ...state.mainPosts],
      };
    case ADD_POST_IN_FAILURE:
      return {
        ...state,
        addPostLoading: false,
        addPostError: action.error,
      };
    default:
      return state;
  }
};

export default postINReducer;
