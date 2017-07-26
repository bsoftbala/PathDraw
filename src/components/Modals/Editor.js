import React from 'react';
import { connect } from 'react-redux';

import { editItem, editItemAttr, higherEdit } from '../../actions';
import Modal from './Modal';
import PathEditor from '../PathEditor';

const defaultLoopInfo = {
  loop: {
    count: 5,
    stepX: 100,
    stepY: 0
  },
  '2dLoop': {
    count: 5,
    offset: 100,
    step: 20,
    county: 5,
    offsety: 100,
    stepy: 20
  },
  circular: {
    count: 5,
    centerX: 250,
    centerY: 250
  },
  none: {}
};

let Editor = ({ data, index, dispatch, popups }) => {
  if(!popups.editor){
    return null;
  }
  const loopTypeChange = (e) => {
    const newData = { ...data,
      loopType: e.target.value,
      loopInfo: { ...defaultLoopInfo[e.target.value] }
    };
    dispatch(editItem(newData, index));
  };

  const loopInfoChange = (type, e) => {
    const newData = { ...data,
      loopInfo: { ...data.loopInfo, [type]: parseInt(e.target.value) }
    };
    dispatch(editItem(newData, index));
  };

  const attrChange = (type, e) => {
    const newData = { ...data, [type]: parseInt(e.target.value) };
    dispatch(editItemAttr(newData, index));
  };

  let input = '';
  switch (data.type) {
    case 'rect':
      input = (
        <div className="lineWidth">
          <label >X : </label>
          <input
            className="form-control"
            type="text"
            value={data.x}
            onChange={(e) => { attrChange('x', e); }}
          />
          <label className="line">Y : </label>
          <input
            className="form-control"
            type="text"
            value={data.y}
            onChange={(e) => { attrChange('y', e); }}
          />
          <div>
            <label >Width : </label>
            <input
              className="form-control "
              type="text"
              value={data.width}
              onChange={(e) => { attrChange('width', e); }}
            />
            <label className="line1">Height : </label>
            <input
              className="form-control "
              type="text"
              value={data.height}
              onChange={(e) => { attrChange('height', e); }}
            />
          </div>
          <div>
            <label >Border Radius : </label>
            <input
              className="form-control "
              type="text"
              value={data.borderRadius}
              onChange={(e) => { attrChange('borderRadius', e); }}
            />
          </div>
        </div>
        );
      break;
    case 'line':
      input = (
        <div className="lineWidth">
          <label >X1 : </label>
          <input
            className="form-control"
            type="text"
            value={data.x1}
            onChange={(e) => { attrChange('x1', e); }}
          />
          <label className="line">Y1 : </label>
          <input
            className="form-control"
            type="text"
            value={data.y1}
            onChange={(e) => { attrChange('y1', e); }}
          />
          <div>
            <label >X2 : </label>
            <input
              className="form-control "
              type="text"
              value={data.x2}
              onChange={(e) => { attrChange('x2', e); }}
            />
            <label className="line1">Y2 : </label>
            <input
              className="form-control "
              type="text"
              value={data.y2}
              onChange={(e) => { attrChange('y2', e); }}
            />
          </div>
        </div>
        );
      break;
    case 'circle':
      input = (
        <div className="circleWidth">
          <label>centerX : </label>
          <input
            className="form-control"
            type="text"
            value={data.cx}
            onChange={(e) => { attrChange('cx', e); }}
          />
          <label className="circle">centerY : </label>
          <input
            className="form-control"
            type="text"
            value={data.cy}
            onChange={(e) => { attrChange('cy', e); }}
          />
          <label className="circle">radius : </label>
          <input
            className="form-control"
            type="text"
            value={data.r}
            onChange={(e) => { attrChange('r', e); }}
          />
        </div>
        );
      break;
    case 'ellipse':
      input = (
        <div className="ellipseWidth">
          <label className="ellipse" >centerX : </label>
          <input
            className="form-control"
            type="text"
            value={data.cx}
            onChange={(e) => { attrChange('cx', e); }}
          />
          <label className="ellipse">centerY : </label>
          <input
            className="form-control"
            type="text"
            value={data.cy}
            onChange={(e) => { attrChange('cy', e); }}
          />
          <div>
            <label className="ellipse1" >radiusX : </label>
            <input
              className="form-control"
              type="text"
              value={data.rx}
              onChange={(e) => { attrChange('rx', e); }}
            />
            <label className="ellipse1">radiusY : </label>
            <input
              className="form-control"
              type="text"
              value={data.ry}
              onChange={(e) => { attrChange('ry', e); }}
            />
          </div>
        </div>
        );
      break;
    case 'path':
      input = (<PathEditor />);
      break;
  }

  let loopDom = '';
  switch (data.loopType) {
    case 'loop':
      loopDom = (
        <div className="loopInfo loopCount">
          <label>Loop Count:</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.count}
            onChange={(e) => { loopInfoChange('count', e); }}
          />
          <label>Step - X :</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.stepX}
            onChange={(e) => { loopInfoChange('stepX', e); }}
          />
          <label>Step - Y :</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.stepY}
            onChange={(e) => { loopInfoChange('stepY', e); }}
          />
        </div>
        );
      break;
      /*
      case '2dLoop':
        loopDom = (
          <div className = "loopInfo ">
              <label>Loop Count:</label>
              <input className="form-control" type = "number" id = "count" value = {this.state.loopInfo.count} onChange = {this.updateLoopInfo}/>
              <label>Offset :</label>
              <input className="form-control" type = "number" id = "offset" value = {this.state.loopInfo.offset} onChange = {this.updateLoopInfo}/>
              <label>Step :</label>
              <input className="form-control" type = "number" id = "step" value = {this.state.loopInfo.step} onChange = {this.updateLoopInfo}/>

              <label>Loop Count Y:</label>
              <input className="form-control" type = "number" id = "county" value = {this.state.loopInfo.county} onChange = {this.updateLoopInfo}/>
              <label>Offset Y:</label>
              <input className="form-control" type = "number" id = "offsety" value = {this.state.loopInfo.offsety} onChange = {this.updateLoopInfo}/>

              <label>Step Y:</label>
              <input className="form-control" type = "number" id = "stepy" value = {this.state.loopInfo.stepy} onChange = {this.updateLoopInfo}/>
            </div>
        )
        break;
      */
    case 'circular':
      loopDom = (
        <div className="loopInfo circleXY">
          <label>Count:</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.count}
            onChange={(e) => { loopInfoChange('count', e); }}
          />
          <label>Center X :</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.centerX}
            onChange={(e) => { loopInfoChange('centerX', e); }}
          />

          <label>Center Y :</label>
          <input
            className="form-control"
            type="number"
            value={data.loopInfo.centerY}
            onChange={(e) => { loopInfoChange('centerY', e); }}
          />
        </div>
        );
      break;

  }
  return (
    <Modal title="Editor" id="editItemPanel" popupName={'editor'}>
      <div>
        <label >Loop Type : </label>
        <select className="form-control" value={data.loopType || 'none'} onChange={loopTypeChange}>
          <option value="">None </option>
          <option value="loop">Loop </option>
          {/*
              <option value = "2dLoop"> 2D Loop </option> */}
          <option value="circular" > Circular </option>
        </select>
        <button onClick = {e => { dispatch(higherEdit())}} className="form-control" > Select All </button>
      </div>
      {loopDom}
      <div className="inputWrapper2">
        {input}
      </div>
    </Modal>
  );
};


const mapStateToProps = ({ allDraws, config }) => ({ data: allDraws.present.list.get(allDraws.present.currentId),
  index: allDraws.present.currentId,
  popups: config.present.popups
});

Editor = connect(mapStateToProps)(Editor);

export default Editor;
