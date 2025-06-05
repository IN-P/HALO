import { HYDRATE } from 'next-redux-wrapper';
import { combineReducers } from 'redux';

import post_IN from './post_IN';
import user_YG from './user_YG';
import profile_jh from './profile_jh';

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
  profile_jh,
  post_IN,
  user_YG,
});

export default rootReducer;
