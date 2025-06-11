import produce from "immer";

export const initialState = {
  notification: [],
  loadUserNotificationLoading: false,
  loadUserNotificationDone: false,
  loadUserNotificationError: null,

  isReadTrueLoading: false,
  isReadTrueDone: false,
  isReadTrueError: null,

  deleteNotificationLoading: false,
  deleteNotificationDone: false,
  deleteNotificationError: null,

  deleteAllNotificationLoading: false,
  deleteAllNotificationDone: false,
  deleteAllNotificationError: null,
};
// 알림 불러오기
export const LOAD_USER_NOTIFICATION_REQUEST = "LOAD_USER_NOTIFICATION_REQUEST";
export const LOAD_USER_NOTIFICATION_SUCCESS = "LOAD_USER_NOTIFICATION_SUCCESS";
export const LOAD_USER_NOTIFICATION_FAILURE = "LOAD_USER_NOTIFICATION_FAILURE";

// 알림 읽음 처리
export const IS_READ_TRUE_REQUEST = "IS_READ_TRUE_REQUEST";
export const IS_READ_TRUE_SUCCESS = "IS_READ_TRUE_SUCCESS";
export const IS_READ_TRUE_FAILURE = "IS_READ_TRUE_FAILURE";

// 알림 삭제
export const DELETE_NOTIFICATION_REQUEST = "DELETE_NOTIFICATION_REQUEST";
export const DELETE_NOTIFICATION_SUCCESS = "DELETE_NOTIFICATION_SUCCESS";
export const DELETE_NOTIFICATION_FAILURE = "DELETE_NOTIFICATION_FAILURE";

// 전체 알림 삭제
export const DELETE_ALL_NOTIFICATION_REQUEST = "DELETE_ALL_NOTIFICATION_REQUEST";
export const DELETE_ALL_NOTIFICATION_SUCCESS = "DELETE_ALL_NOTIFICATION_SUCCESS";
export const DELETE_ALL_NOTIFICATION_FAILURE = "DELETE_ALL_NOTIFICATION_FAILURE";

const notification_JH = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      // 알림 불러오기
      case LOAD_USER_NOTIFICATION_REQUEST:
        draft.loadUserNotificationLoading = true;
        draft.loadUserNotificationDone = false;
        draft.loadUserNotificationError = null;
        break;
      case LOAD_USER_NOTIFICATION_SUCCESS:
        draft.loadUserNotificationLoading = false;
        draft.notification = action.data;
        draft.loadUserNotificationDone = true;
        break;
      case LOAD_USER_NOTIFICATION_FAILURE:
        draft.loadUserNotificationLoading = false;
        draft.loadUserNotificationError = action.data;
        break;
        // 알림 읽음 처리
        case IS_READ_TRUE_REQUEST:
          draft.isReadTrueLoading = true;
          draft.isReadTrueDone = false;
          draft.isReadTrueError = null;
          break;
        case IS_READ_TRUE_SUCCESS:
          draft.isReadTrueLoading = false;
          draft.notification = action.data;
          draft.isReadTrueDone = true;
          break;
        case IS_READ_TRUE_FAILURE:
          draft.isReadTrueLoading = false;
          draft.isReadTrueError = action.data;
          break;
        // 알림 삭제
        case DELETE_NOTIFICATION_REQUEST:
          draft.deleteNotificationLoading = true;
          draft.deleteNotificationDone = false;
          draft.deleteNotificationError = null;
          break;
        case DELETE_NOTIFICATION_SUCCESS:
          draft.deleteNotificationLoading = false;
          draft.deleteNotificationDone = true;
          draft.notification = action.data;
          break;
        case DELETE_NOTIFICATION_FAILURE:
          draft.deleteNotificationLoading = false;
          draft.deleteNotificationError = action.data;
          break;
        // 전체 알림 삭제
        case DELETE_ALL_NOTIFICATION_REQUEST:
          draft.deleteAllNotificationLoading = true;
          draft.deleteAllNotificationDone = false;
          draft.deleteAllNotificationError = null;
          break;
        case DELETE_ALL_NOTIFICATION_SUCCESS:
          draft.deleteAllNotificationLoading = false;
          draft.deleteAllNotificationDone = true;
          draft.notification = action.data;
          break;
        case DELETE_ALL_NOTIFICATION_FAILURE:
          draft.deleteAllNotificationLoading = false;
          draft.deleteAllNotificationError = action.data;
          break;
        default:
          break;
    }
  });

export default notification_JH;
