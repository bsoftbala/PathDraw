import { List } from 'immutable';

import * as utils from '../utils';
import * as createUtils from '../utils/createUtils';

const initDraw = {type: 'path', id: 'pathasdfgasdfs',  d: 'M 100 100 C 100 200 200 200 200 100'  }
const initialState = {
  //list: new List([initDraw]),
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

export default function allDraws(state = initialState, action) {
  console.log('allDraws');
  console.dir(action);
  switch (action.type) {
    case 'INSERT':
      const id = action.insertType + action.nextId;
      let obj;
      const {ptx, pty, pt2x, pt2y} = action;
      switch(action.insertType){
        case 'rect':{
          obj = Object.assign({}, {x: (ptx<pt2x)?ptx:pt2x, y: (pty<pt2y)?pty:pt2y, 
            width: Math.abs(pt2x - ptx), height: Math.abs( pt2y - pty), borderRadius: 0 }, { id, type: action.insertType});
          obj.d = createUtils.getRect(obj);
          break;
        }
        case 'line':{
           obj = Object.assign({}, {x1: ptx, y1: pty, x2: pt2x, y2: pt2y}, { id, type: action.insertType });
           obj.d = createUtils.getLine(obj);
          break;
        }
        case 'arrow':{
          obj = Object.assign({}, {x1: ptx, y1: pty, x2: pt2x, y2: pt2y, isDouble:false}, { id, type: action.insertType });
          obj.d = createUtils.getArrow(obj);
          break;
        }
        case 'circle':{
          let rx = parseInt(Math.abs(ptx - pt2x)/2);
          let ry = parseInt(Math.abs(pty - pt2y)/2);
          let r = rx<ry?rx:ry;
          let x = (ptx<pt2x)?ptx:pt2x;
          let y = (pty<pt2y)?pty:pt2y;
          obj = Object.assign({}, {cx: x + r, cy: y + r, r }, { id, type: action.insertType });
          obj.d = createUtils.getCircle(obj);
          break;
        }
        case 'ellipse':{
          let rx = parseInt(Math.abs(ptx - pt2x)/2);
          let ry = parseInt(Math.abs(pty - pt2y)/2);
          let x = (ptx<pt2x)?ptx:pt2x;
          let y = (pty<pt2y)?pty:pt2y;
          obj = Object.assign({}, {cx: x + rx, cy: y + ry, rx, ry}, { id, type: action.insertType, reFix:true  });
          obj.d = createUtils.getEllipse(obj);
          break;
        }
        case 'path':{
          obj = Object.assign({}, {d: action.ptx}, { id, type: action.insertType });
          break;
        }
        default:{
          obj = Object.assign({}, insertNewTemplate[action.insertType], { id, type: action.insertType });
          break;
        }
      } 
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
    case 'EDIT_ITEM_MICRO':
      return { ...state, list: state.list.set(action.index, action.data) };
    case 'EDIT_ITEM_ATTR':{
      let data = {...action.data}
      let str = data.type;
      str = 'get' + str.charAt(0).toUpperCase() + str.substr(1);
      console.log("str = " + str);
      data.d = createUtils[str](data);
      return { ...state, list: state.list.set(action.index, data) };
    }
    case 'SELECT_PATH_SEG':
      return { ...state, segIndex: action.index };
    case 'EDIT_SOURCE':
      const list = utils.nodeToData(action.svgStr);
      return { ...state, list };
    case 'HIGHER_EDIT':
      console.log('HIGHER_EDIT');
      return { ...state, segIndex: -1};  
    default:
      return state;
  }
}
