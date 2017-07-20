import { combineReducers } from 'redux';
import config from './config';
import allDraws from './allDraws';
import guide from './guide';

const rootReducer = combineReducers({
  config,
  allDraws,
  guide
});

export default rootReducer;
