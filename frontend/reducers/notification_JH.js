import { TruckFilled } from "@ant-design/icons";
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
};
// 알림 불러오기
export const LOAD_USER_NOTIFICATION_REQUEST = "LOAD_USER_NOTIFICATION_REQUEST";
export const LOAD_USER_NOTIFICATION_SUCCESS = "LOAD_USER_NOTIFICATION_SUCCESS";
export const LOAD_USER_NOTIFICATION_FAILURE = "LOAD_USER_NOTIFICATION_FAILURE";

// 알림 읽음 처리
export const IS_READ_TRUE_LOADING = "IS_READ_TRUE_LOADING";
export const IS_READ_TRUE_SUCCESS = "IS_READ_TRUE_SUCCESS";
export const IS_READ_TRUE_FAILURE = "IS_READ_TRUE_FAILURE";

// 알림 삭제
export const DELETE_NOTIFICATION_LOADING = "DELETE_NOTIFICATION_LOADING";
export const DELETE_NOTIFICATION_SUCCESS = "DELETE_NOTIFICATION_SUCCESS";
export const DELETE_NOTIFICATION_FAILURE = "DELETE_NOTIFICATION_FAILURE";

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
        case IS_READ_TRUE_LOADING:
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
      default:
        break;
    }
  });

export default notification_JH;
