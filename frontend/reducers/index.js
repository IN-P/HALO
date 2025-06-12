import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import post_IN from './post_IN';
import bookmark_IN from './bookmark_IN';
import comment_IN from './comment_IN';
import hashtag_IN from './hashtag_IN';
import regram_IN from './regram_IN';
import notification_JH from './notification_JH';
import follow_YB from './follow_YB';
import reportReducer from './report_YB';
import block from './block';
import user_YG from './user_YG';
import profile_jh from './profile_jh';
import quiz from './quiz_GM';
import adminQuiz from './adminQuiz_GM';
import adminPlayer from './adminPlayer_GM';
import playerDraw from './playerDraw_GM'; 
import activeLog_JH from './activeLog_JH';
import reportResult_YB from './reportResult_YB';
import badge_JH from './badge_JH';

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
  bookmark_IN,
  comment_IN,
  hashtag_IN,
  regram_IN,
  follow_YB,
  report_YB: reportReducer,
  block,
  user_YG,
  profile_jh,
  notification_JH,
  quiz,
  adminQuiz,
  adminPlayer,
  playerDraw,
  activeLog_JH,
  reportResult_YB,
  badge_JH,

});

export default rootReducer;