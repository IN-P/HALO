import produce from 'immer';

//  액션 타입
export const LOG_IN_REQUEST = 'LOG_IN_REQUEST';
export const LOG_IN_SUCCESS = 'LOG_IN_SUCCESS';
export const LOG_IN_FAILURE = 'LOG_IN_FAILURE';

export const LOG_OUT_REQUEST = 'LOG_OUT_REQUEST';
export const LOG_OUT_SUCCESS = 'LOG_OUT_SUCCESS';
export const LOG_OUT_FAILURE = 'LOG_OUT_FAILURE';

export const SIGN_UP_REQUEST = 'SIGN_UP_REQUEST';
export const SIGN_UP_SUCCESS = 'SIGN_UP_SUCCESS';
export const SIGN_UP_FAILURE = 'SIGN_UP_FAILURE';
export const SIGN_UP_RESET = 'SIGN_UP_RESET';

export const LOAD_MY_INFO_REQUEST = 'LOAD_MY_INFO_REQUEST';
export const LOAD_MY_INFO_SUCCESS = 'LOAD_MY_INFO_SUCCESS';
export const LOAD_MY_INFO_FAILURE = 'LOAD_MY_INFO_FAILURE';

// 준혁 : 회원탈퇴
export const DELETE_ACCOUNT_REQUEST = 'DELETE_ACCOUNT_REQUEST';
export const DELETE_ACCOUNT_SUCCESS = 'DELETE_ACCOUNT_SUCCESS';
export const DELETE_ACCOUNT_FAILURE = 'DELETE_ACCOUNT_FAILURE';

//  초기 상태
export const initialState = {
  user: null,
  isLogin: null,

  logInLoading: false,
  logInDone: false,
  logInError: null,

  logOutLoading: false,
  logOutDone: false,
  logOutError: null,

  signUpLoading: false,
  signUpDone: false,
  signUpError: null,

  loadMyInfoLoading: false,
  loadMyInfoDone: false,
  loadMyInfoError: null,

  // 준혁 : 회원탈퇴
  deleteAccountLoading: false,
  deleteAccountDone: false,
  deleteAccountError: null,
  //
};

//  리듀서
const reducer = (state = initialState, action) => produce(state, (draft) => {
  switch (action.type) {
    // 로그인
    case LOG_IN_REQUEST:
      draft.logInLoading = true;
      draft.logInError = null;
      draft.logInDone = false;
      break;
    case LOG_IN_SUCCESS:
      draft.logInLoading = false;
      draft.logInDone = true;
      draft.isLogin = true;
      draft.user = action.data;
      break;
    case LOG_IN_FAILURE:
      draft.logInLoading = false;
      draft.isLogin = false;
      draft.logInError = action.error;
      break;

    // 로그아웃
    case LOG_OUT_REQUEST:
      draft.logOutLoading = true;
      draft.logOutError = null;
      draft.logOutDone = false;
      break;
    case LOG_OUT_SUCCESS:
      draft.logOutLoading = false;
      draft.logOutDone = true;
      draft.isLogin = false;
      draft.user = null;
      draft.logInDone = false
      break;
    case LOG_OUT_FAILURE:
      draft.logOutLoading = false;
      draft.logOutError = action.error;
      break;

    // 회원가입
    case SIGN_UP_REQUEST:
      draft.signUpLoading = true;
      draft.signUpError = null;
      draft.signUpDone = false;
      break;
    case SIGN_UP_SUCCESS:
      draft.signUpLoading = false;
      draft.signUpDone = true;
      break;
    case SIGN_UP_FAILURE:
      draft.signUpLoading = false;
      draft.signUpError = action.error;
      break;
    case SIGN_UP_RESET:
      draft.signUpDone = false;
      draft.signUpError = null;
    break;

    // 내 정보 불러오기
    case LOAD_MY_INFO_REQUEST:
      draft.loadMyInfoLoading = true;
      draft.loadMyInfoError = null;
      draft.loadMyInfoDone = false;
      break;
    case LOAD_MY_INFO_SUCCESS:
      draft.loadMyInfoLoading = false;
      draft.loadMyInfoDone = true;
      draft.isLogin = true;
      draft.user = action.data;
      break;
    case LOAD_MY_INFO_FAILURE:
      draft.loadMyInfoLoading = false;
      draft.loadMyInfoError = action.error;
      draft.isLogin = false;
      draft.user = null;
      break;

    // 준혁 : 회원탈퇴
    case DELETE_ACCOUNT_REQUEST:
      draft.deleteAccountLoading = true;
      draft.deleteAccountDone = false;
      draft.deleteAccountError = null;
      break;
    case DELETE_ACCOUNT_SUCCESS:
      draft.deleteAccountLoading = false;
      draft.deleteAccountDone = true;
      draft.isLogin = null;
      break;
    case DELETE_ACCOUNT_FAILURE:
      draft.deleteAccountLoading = false;
      draft.deleteAccountError = action.error;
      break;
      //

    default:
      break;
  }
});

export default reducer;
