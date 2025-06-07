import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';
import post_IN from './post_IN';
import user_YG from './user_YG';

import follow_YB from './follow_YB';
import reportReducer from './report_YB';
import profile_jh from './profile_jh';
import bookmark_IN from './bookmark_IN';
import comment_IN from './comment_IN';

import block from './block';//율비


import hashtag_IN from './hashtag_IN';
import regram_IN from './regram_IN';


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
  user_YG,
  block,//율비
  profile_jh,
});

export default rootReducer;