let nextId = 100;
const currentId = 0;

// Actions from Toolbar

export const insert = insertType => ({
  type: 'INSERT',
  insertType,
  nextId: nextId++
});

export const remove = (isAll, id) => ({
  type: 'REMOVE',
  isAll,
  currentId
});

export const showPopup = (popupName, isShow = true) => ({
  type: 'SHOW_POPUP',
  popupName,
  isShow
});

export const zoom = zoomType => ({
  type: 'ZOOM',
  zoomType
});

// Actions from Properties Panel


export const setDimension = (isWidth, value) => ({
  type: 'CHANGE_DIMENSION',
  isWidth,
  value
});

export const setStroke = value => ({
  type: 'CHANGE_STROKE',
  value
});

export const setStrokeWidth = value => ({
  type: 'CHANGE_STROKE_WIDTH',
  value
});

export const setFill = value => ({
  type: 'CHANGE_FILL',
  value
});


export const openUnitPopup = index => ({
  type: 'OPEN_UNIT_POPUP',
  index
});

export const changeStackOrder = isUp => ({
  type: 'CHANGE_STACK_ORDER',
  isUp
});

export const editItem = (data, index) => ({
  type: 'EDIT_ITEM',
  data,
  index
});

export const selectPathSeg = index => ({
  type: 'SELECT_PATH_SEG',
  index
});

export const editSource = svgStr => ({
  type: 'EDIT_SOURCE',
  svgStr
});

