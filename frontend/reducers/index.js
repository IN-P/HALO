import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';

import post_IN from './post_IN';
import user_YG from './user_YG';
import quiz from './quiz_GM';  // 추가
import adminQuiz from './adminQuiz_GM';  // 추가
import adminPlayer from './adminPlayer_GM';  // 추가
import playerDraw from './playerDraw_GM';  // 추가

const rootReducer = combineReducers({
  index: (state = {}, action) => {
    switch (action.type) {
      case HYDRATE:
        console.log('HYDRATE', action);
        return { ...state, ...action.payload };
      default:
        return state;
    }
  },
  post_IN,
  user_YG,
  quiz,  // 추가
  adminQuiz,  // 추가
  adminPlayer,  // 추가
  playerDraw,  // 추가
});

export default rootReducer;
