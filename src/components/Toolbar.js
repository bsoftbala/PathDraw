import React from 'react';
import { connect } from 'react-redux';
import { insert, remove, showPopup, zoom } from '../actions';

let Toolbar = (props) => {
  let insertType;
  console.dir(props);
  const dispatch = props.dispatch;
  return (
    <div className="toolsWrapper">
      {/*
              <button className="btn btn-primary"><i className="fa fa-floppy-o"></i> Save</button>
              <button className="btn btn-primary"><i className="fa fa-download" aria-hidden="true"></i> Save As Copy </button>
             */}
      <select className="form-control" id="insertType" ref={(n) => { insertType = n; }}>
        <option value="line">Line </option>
        <option value="circle"> Circle </option>
        <option value="ellipse" > Ellipse </option>
        <option value="path"> Path </option>
      </select>
      <button className="btn btn-primary" onClick={e => dispatch(insert(insertType.value))} id="showInsert">
        <i className="fa fa-level-down" aria-hidden="true" />
          	Insert
          </button>
      <span className="divider" />
      <button className="btn btn-primary" onClick={e => dispatch(remove(true))}>
        <i className="fa fa-trash" aria-hidden="true" />
          	Clear All
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(remove(false))}>
        <i className="fa fa-eraser" aria-hidden="true" />
          	Remove
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(showPopup('allDraws'))} id="showDrawList">
        <i className="fa fa-list" aria-hidden="true" />
          	Draw List
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(showPopup('source'))} id="showSource">
        <i className="fa fa-file-code-o" aria-hidden="true" />
          	Source
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(showPopup('guide'))} id="showGuide">
        <i className="fa fa-book" aria-hidden="true" />
          	Guide
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(showPopup('properties'))} id="showProperties">
        <i className="fa fa-sliders" aria-hidden="true" />
          	Properties
          </button>
      <span className="divider" />
      <button className="btn btn-primary" id="zoomIn" onClick={e => dispatch(zoom('in'))}>
        <i className="fa fa-search-plus" aria-hidden="true" />
          	Zoom In
          </button>
      <button className="btn btn-primary" id="zoomOut" onClick={e => dispatch(zoom('out'))}>
        <i className="fa fa-search-minus" aria-hidden="true" />
          	Zoom Out
          	</button>
      <button className="btn btn-primary" id="zoomFit" onClick={e => dispatch(zoom('fit'))}>
        <i className="fa fa-clone" aria-hidden="true" />
          	Exact Fit
          </button>
      <button className="btn btn-primary" id="animateBtn" onClick={e => dispatch(zoom('fit'))}>
        <i className="fa fa-play" aria-hidden="true" />
          	Animate
          </button>
    </div>
  );
};

Toolbar = connect()(Toolbar);

export default Toolbar;
