const initialState = {
  width: 600,
  height: 480,
  stroke: '#0000ff',
  strokeWidth: 1,
  fill: 'none',
  insertType: 'path',
  popups: {
        	allDraws: true,
        	editor: false,
        	guide: false,
        	properties: false,
        	source: false
  },
  zoom: 1
};

export default function config(state = initialState, action) {
  switch (action.type) {
    case 'CHANGE_INSERT_TYPE':
      return { ...state, insertType: action.insertType}
    case 'CHANGE_DIMENSION':
      if (action.value < 50) {
	      action.value = 50;
	    } else if (action.value > 1000) {
	      action.value = 1000;
	    }
	    if (action.isWidth) {
	    	return { ...state, width: action.value };
	    }
	    	return { ...state, height: action.value };

    case 'CHANGE_STROKE':
      console.log(`action.value = ${action.value}`);
      return { ...state, stroke: action.value };
    case 'CHANGE_STROKE_WIDTH':
      return { ...state, strokeWidth: action.value };
    case 'CHANGE_FILL':
      return { ...state, fill: action.value };
    case 'SHOW_POPUP':{
      const obj = { ...state.popups, [action.popupName]: action.isShow };
      return { ...state, popups: obj };
    }
    case 'ZOOM':
      let zoom = state.zoom;
      switch (action.zoomType) {
        case 'in':
          zoom += 0.2;
          break;
        case 'out':
          zoom -= 0.2;
          break;
        case 'fit':
          zoom = 1;
          break;
      }
      console.log(`new zoom = ${zoom}`);
      return { ...state, zoom };
    case 'OPEN_UNIT_POPUP':{
      const obj = { ...state.popups, editor: true };
      return { ...state, popups: obj };
    }
    case 'REMOVE':{
      console.log('REMOVE');
      const obj = { ...state.popups, editor: false };
      return { ...state, popups: obj };
    }
    default:
      return state;
  }
}
