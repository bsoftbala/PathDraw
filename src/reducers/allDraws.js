import { List } from 'immutable';

import * as utils from '../utils';

const initialState = {
  list: new List([]),
  currentId: -1,
  segIndex: -1
};

const insertNewTemplate = {
  line: { x1: 100, y1: 100, x2: 200, y2: 100 },
  circle: { cx: 100, cy: 100, r: 50 },
  ellipse: { cx: 100, cy: 100, rx: 50, ry: 80 },
  path: { d: 'M 100 100 C 100 200 200 200 200 100' }
};

export default function data(state = initialState, action) {
  console.dir(action);
  switch (action.type) {
    case 'INSERT':
      const id = action.insertType + action.nextId;
      const obj = Object.assign({}, insertNewTemplate[action.insertType], { id, type: action.insertType });
      const newState = { ...state, list: state.list.push(obj) , currentId: state.list.size };
      return newState;
    case 'REMOVE':
      if (action.isAll) {
        return { ...state, list: state.list.clear(), currentId: -1 };
      }
      let currentId;
      if(state.list.size == 1){
        currentId = -1;
      }else if(state.currentId == state.list.size - 1){
        currentId = state.currentId - 1;
      }
      return { ...state, list: state.list.delete(state.currentId), currentId };
    case 'ZOOM':
      return state;
    case 'CHANGE_STACK_ORDER':
      console.log(`action.isUp = ${action.isUp}`, state.currentId);
      if (action.isUp && state.currentId !== 0) {
        const item = state.list.get(state.currentId);
        const list = state.list.delete(state.currentId).insert(state.currentId - 1, item);
        return { ...state, list, currentId: state.currentId - 1 };
      } else if (!action.isUp && state.currentId !== state.list.size - 1) {
        const item = state.list.get(state.currentId);
        const list = state.list.delete(state.currentId).insert(state.currentId + 1, item);
        return { ...state, list, currentId: state.currentId + 1 };
      }
      return state;
    case 'OPEN_UNIT_POPUP':
      return { ...state, currentId: parseInt(action.index), segIndex: -1 };
    case 'CHANGE_STROKE':
      let data = state.list.get(state.currentId);
      data = { ...data, stroke: action.value };
      return { ...state, list: state.list.set(state.currentId, data) };
    case 'CHANGE_STROKE_WIDTH':
      let data2 = state.list.get(state.currentId);
      data2 = { ...data2, strokeWidth: action.value };
      return { ...state, list: state.list.set(state.currentId, data2) };
    case 'CHANGE_FILL':
      let data3 = state.list.get(state.currentId);
      data3 = { ...data3, fill: action.value };
      return { ...state, list: state.list.set(state.currentId, data3) };
    case 'EDIT_ITEM':
      return { ...state, list: state.list.set(action.index, action.data) };
    case 'SELECT_PATH_SEG':
      return { ...state, segIndex: action.index };
    case 'EDIT_SOURCE':
      const list = utils.nodeToData(action.svgStr);
      return { ...state, list };
    default:
      return state;
  }
}
