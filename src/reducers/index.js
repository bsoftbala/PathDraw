import { combineReducers } from 'redux';
import undoable, {excludeAction} from 'redux-undo';

import config from './config';
import allDraws from './allDraws';
import guide from './guide';

const rootReducer = combineReducers({
  config: undoable(config, {limit: 5}),
  allDraws: undoable(allDraws, {limit: 5, filter: excludeAction('EDIT_ITEM_MICRO')}),
  guide: undoable(guide, {limit: 5})
});

export default rootReducer;
