// reducers/reportResult.js

// 1. 액션 타입 정의
export const SUSPEND_USER_REQUEST = 'SUSPEND_USER_REQUEST';
export const SUSPEND_USER_SUCCESS = 'SUSPEND_USER_SUCCESS';
export const SUSPEND_USER_FAILURE = 'SUSPEND_USER_FAILURE';

// 2. 초기 상태
const initialState = {
  suspendLoading: false,   // 정지 처리 중
  suspendDone: false,      // 정지 처리 완료
  suspendError: null,      // 정지 실패 에러
};

// 3. 리듀서 함수
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SUSPEND_USER_REQUEST:
      return {
        ...state,
        suspendLoading: true,
        suspendDone: false,
        suspendError: null,
      };
    case SUSPEND_USER_SUCCESS:
      return {
        ...state,
        suspendLoading: false,
        suspendDone: true,
      };
    case SUSPEND_USER_FAILURE:
      return {
        ...state,
        suspendLoading: false,
        suspendError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
