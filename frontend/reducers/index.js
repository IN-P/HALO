import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';

import post_IN from './post_IN';
import user_YG from './user_YG';
import bookmark_IN from './bookmark_IN';
import comment_IN from './comment_IN';

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
  bookmark_IN,
  comment_IN,
});

export default rootReducer;
