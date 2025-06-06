export const initialState = {
  blockList: [],
  blockLoading: false,
  blockDone: false,
  blockError: null,
};

export const BLOCK_USER_REQUEST = 'BLOCK_USER_REQUEST';
export const BLOCK_USER_SUCCESS = 'BLOCK_USER_SUCCESS';
export const BLOCK_USER_FAILURE = 'BLOCK_USER_FAILURE';

export const UNBLOCK_USER_REQUEST = 'UNBLOCK_USER_REQUEST';
export const UNBLOCK_USER_SUCCESS = 'UNBLOCK_USER_SUCCESS';
export const UNBLOCK_USER_FAILURE = 'UNBLOCK_USER_FAILURE';

export const LOAD_BLOCKS_REQUEST = 'LOAD_BLOCKS_REQUEST';
export const LOAD_BLOCKS_SUCCESS = 'LOAD_BLOCKS_SUCCESS';
export const LOAD_BLOCKS_FAILURE = 'LOAD_BLOCKS_FAILURE';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case BLOCK_USER_REQUEST:
    case UNBLOCK_USER_REQUEST:
    case LOAD_BLOCKS_REQUEST:
      return {
        ...state,
        blockLoading: true,
        blockDone: false,
        blockError: null,
      };
    case BLOCK_USER_SUCCESS:
      return {
        ...state,
        blockLoading: false,
        blockDone: true,
        blockList: [...state.blockList, action.data],
      };
    case UNBLOCK_USER_SUCCESS:
      return {
        ...state,
        blockLoading: false,
        blockDone: true,
        blockList: state.blockList.filter((u) => u.id !== action.data),
      };
    case LOAD_BLOCKS_SUCCESS:
      return {
        ...state,
        blockLoading: false,
        blockList: action.data,
      };
    case BLOCK_USER_FAILURE:
    case UNBLOCK_USER_FAILURE:
    case LOAD_BLOCKS_FAILURE:
      return {
        ...state,
        blockLoading: false,
        blockError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
