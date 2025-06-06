// reducers/report_YB.js

export const REPORT_POST_REQUEST = 'REPORT_POST_REQUEST';
export const REPORT_POST_SUCCESS = 'REPORT_POST_SUCCESS';
export const REPORT_POST_FAILURE = 'REPORT_POST_FAILURE';

const initialState = {
  reportLoading: false,
  reportDone: false,
  reportError: null,
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case REPORT_POST_REQUEST:
      return {
        ...state,
        reportLoading: true,
        reportDone: false,
        reportError: null,
      };
    case REPORT_POST_SUCCESS:
      return {
        ...state,
        reportLoading: false,
        reportDone: true,
      };
    case REPORT_POST_FAILURE:
      return {
        ...state,
        reportLoading: false,
        reportError: action.error,
      };
    default:
      return state;
  }
};

export default reportReducer;
