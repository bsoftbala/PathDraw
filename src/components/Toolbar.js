import React from 'react';
import { connect } from 'react-redux';
import { changeInsertType, remove, showPopup, zoom } from '../actions';
import {ActionCreators} from 'redux-undo';

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
      <select className="form-control" id="insertType" value = {props.insertType} 
        onChange = {e => {dispatch(changeInsertType(e.target.value))}}>
        <option value="path"> Free Hand </option>
        <option value="rect"> Rect </option>
        <option value="line">Line </option>
        <option value="circle"> Circle </option>
        <option value="ellipse" > Ellipse </option>
        <option value="arrow" > Arrow </option>
      </select>
      <button className="btn btn-primary" onClick={e => dispatch(ActionCreators.undo())} /*style = {{color: props.isUndoEnabled?'inherit':'gray'}}*/>
        <i className="fa fa-trash" aria-hidden="true" />
           Undo
          </button>
      <button className="btn btn-primary" onClick={e => dispatch(ActionCreators.redo())} /*style = {{color: props.isRedoEnabled?'inherit':'gray'}}*/>
        <i className="fa fa-trash" aria-hidden="true" />
           Redo
          </button>
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

const mapStateToProps = ({ config }) => ({ insertType: config.present.insertType,
  isUndoEnabled: (config.past.length === 0) ? false : true,
  isRedoEnabled: (config.future.length === 0) ? false : true
});


Toolbar = connect(mapStateToProps)(Toolbar);

export default Toolbar;
