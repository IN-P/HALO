export const initialState = {
  blockList: [], // 율비: 차단한 유저 목록
  blockLoading: false, // 율비: 로딩 상태
  blockDone: false, // 율비: 완료 여부
  blockError: null, // 율비: 에러 상태
};

// 액션 타입들
export const BLOCK_USER_REQUEST = 'BLOCK_USER_REQUEST';
export const BLOCK_USER_SUCCESS = 'BLOCK_USER_SUCCESS';
export const BLOCK_USER_FAILURE = 'BLOCK_USER_FAILURE';

export const UNBLOCK_USER_REQUEST = 'UNBLOCK_USER_REQUEST';
export const UNBLOCK_USER_SUCCESS = 'UNBLOCK_USER_SUCCESS';
export const UNBLOCK_USER_FAILURE = 'UNBLOCK_USER_FAILURE';

export const LOAD_BLOCKS_REQUEST = 'LOAD_BLOCKS_REQUEST';
export const LOAD_BLOCKS_SUCCESS = 'LOAD_BLOCKS_SUCCESS';
export const LOAD_BLOCKS_FAILURE = 'LOAD_BLOCKS_FAILURE';

// 리듀서 정의
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case BLOCK_USER_REQUEST: // 율비: 차단 시작
    case UNBLOCK_USER_REQUEST: // 율비: 차단 해제 시작
    case LOAD_BLOCKS_REQUEST: // 율비: 차단 목록 불러오기 시작
      return {
        ...state,
        blockLoading: true, // 율비: 로딩 중
        blockDone: false,
        blockError: null,
      };
    case BLOCK_USER_SUCCESS: // 율비: 차단 성공 시
      return {
        ...state,
        blockLoading: false,
        blockDone: true,
        blockList: [...state.blockList, action.data], // 율비: 차단 유저 추가
      };
    case UNBLOCK_USER_SUCCESS: // 율비: 차단 해제 성공 시
      return {
        ...state,
        blockLoading: false,
        blockDone: true,
        blockList: state.blockList.filter((u) => u.id !== action.data), // 율비: 해당 유저 제거
      };
    case LOAD_BLOCKS_SUCCESS: // 율비: 차단 목록 불러오기 성공
      return {
        ...state,
        blockLoading: false,
        blockList: action.data,
      };
    case BLOCK_USER_FAILURE: // 율비: 차단 실패
    case UNBLOCK_USER_FAILURE: // 율비: 해제 실패
    case LOAD_BLOCKS_FAILURE: // 율비: 목록 불러오기 실패
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
