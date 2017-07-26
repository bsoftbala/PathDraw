import React from 'react';
import { connect } from 'react-redux';

import SvgControlsUI from './SvgControlsUI';
import Ruler from './Ruler';
import { insert, editItem} from '../actions';
import * as utils from '../utils';

class SVGRoot extends React.Component {

  keyboardOffset = 0;
  currentItem = null;
  isKeyDown = false;

  constructor(props){
    super(props);
    console.log("constructorconstructorconstructorconstructor");
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onMoveKeyDown);
    document.addEventListener('keyup', this.onMoveKeyUp);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onMoveKeyDown);
    document.removeEventListener('keyup', this.onMoveKeyUp);
  }

  onMoveKeyDown = e => {
    let {currentId, segIndex} = this.props.allDraws;
    console.log('onMoveKeyDown', currentId, segIndex, e.keyCode)
    if (currentId === -1 || segIndex !== -1) {
      return;
    }
    if (!(e.keyCode >= 37 && e.keyCode <= 40)) {
      return;
    }
    if (!this.keyboardOffset) {
      this.keyboardOffset = { x: 0, y: 0 };
    }
    this.isKeyDown = true;
    let changeBy;
    if(e.shiftKey){
      changeBy = 5;
    }else{
      changeBy = 1;
    }
    switch (e.keyCode) {
      case 37:
        this.keyboardOffset.x -= changeBy;
        break;
      case 38:
        this.keyboardOffset.y -= changeBy;
        break;
      case 39:
        this.keyboardOffset.x += changeBy;
        break;
      case 40:
        this.keyboardOffset.y += changeBy;
        break;
    }
    this.currentItem = this.props.allDraws.list.get(currentId);
    document.getElementById(this.currentItem.id).setAttribute('transform', `translate(${this.keyboardOffset.x},${this.keyboardOffset.y})`);
  }

  onMoveKeyUp = e => {
    if (!this.isKeyDown) {
      return;
    }
    const data = utils.translate(utils.dataToObj(this.currentItem.d), this.keyboardOffset.x, this.keyboardOffset.y);
    const d = utils.objToData(data);
    const path = document.getElementById(this.currentItem.id);
    path.removeAttribute('transform');
    let newData = {...this.currentItem, d}
    this.props.dispatch(editItem(newData, this.props.allDraws.currentId));
    this.keyboardOffset = null;
  }
  

  startPane = e => {
    const content = document.getElementById('contentSvg');
    content.style.cursor = 'grabbing';
    const offset = {
      x: e.clientX - parseInt(content.getAttribute('x')),
      y: e.clientY - parseInt(content.getAttribute('y')),
    };


    const doPane = e => {
      content.setAttribute('x', e.clientX - offset.x);
      content.setAttribute('y', e.clientY - offset.y);
    }

    const endPane = e => {
      content.style.cursor = 'default';
      document.removeEventListener('mousemove', doPane);
      document.removeEventListener('mouseup', endPane);

      let currentItem = this.props.allDraws.list.get(this.props.allDraws.currentId);
      this.props.dispatch(editItem({...currentItem, history:false}, this.props.allDraws.currentId));
      //this.drawScale();
    }
    document.addEventListener('mousemove', doPane);
    document.addEventListener('mouseup', endPane);
  }

  addNewItem = (e) => {
    console.log("SVGRoot onMouseDown");
    if(e.ctrlKey){
      this.startPane(e);
      return;
    }
    
    const {zoom, insertType} = this.props.config;
    this.newOne = document.createElement('rect');
    let pt = utils.toData({x: e.clientX, y: e.clientY}, null, zoom);
    console.log('zoom = ' + zoom);
    const gap = 30;
    let fillTemp = false;
    let data;
    let arr = [];
    if(insertType == "path"){
      data = 'M ' + pt.x + ' ' + pt.y + ' ';
      arr.push(pt.x, pt.y)
      utils.attr(this.tempPath, {display:'block', d:data});
    }else{
      utils.attr(this.tempContent, {display:'block', x: pt.x, y: pt.y, width: 0, height: 0});
    }
    
    const onMouseMove = (e) => {
      const pt2 = utils.toData({x: e.clientX, y: e.clientY}, null, zoom);
      if(insertType == 'path'){
        const dist = Math.sqrt(Math.pow(pt.x-pt2.x, 2) + Math.pow(pt.y-pt2.y, 2));
        console.log('dist = ' + dist);
        if(fillTemp){
          fillTemp = false;
          data = data.substr(0, data.lastIndexOf('L'));
        }
        if(dist > gap){
          data += 'L ' + pt2.x + ' ' + pt2.y + ' ';
          arr.push(pt2.x, pt2.y)
          pt = {...pt2};
        }else{
          fillTemp = true;
          data += 'L ' + pt2.x + ' ' + pt2.y + ' ';
        }
        utils.attr(this.tempPath, {display:'block', d:data});
      }else{
        utils.attr(this.tempContent, {x: (pt.x<pt2.x)?pt.x:pt2.x, y: (pt.y<pt2.y)?pt.y:pt2.y, width: Math.abs(pt2.x - pt.x), height:Math.abs( pt2.y - pt.y)}); 
      }
    }
    const onMouseUp = (e) => {
      const pt2 = utils.toData({x: e.clientX, y: e.clientY}, null, zoom);
      if(insertType == 'path'){
        console.log("arr = " + arr);
        if(arr.length > 2 ){
          let d = utils.getSmoothPath(arr);
          this.props.dispatch(insert(insertType, d));
          utils.attr(this.tempPath, {display:'none'});
        }
      }else{
        this.props.dispatch(insert(insertType, pt.x, pt.y, pt2.x, pt2.y));
        utils.attr(this.tempContent, {display:'none'});
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  render(){
    const config = this.props.config;
    let contentSvg;
    console.dir(this.props.allDraws);
    return (
      <svg id="rootSvg" width={window.innerWidth - 1} height={window.innerHeight - 20} strokeWidth="2" stroke="#c9c9ca" fill="none" >
        <svg
          id="contentSvg"
          ref={(n) => { contentSvg = n; }}
          width={config.width}
          height={config.height}
          x={(window.innerWidth - config.width) / 2 + 10}
          y={(window.innerHeight - config.height) / 2 + 10}
        >
          <rect onMouseDown = {this.addNewItem} width={config.width} height={config.height} x="0" y="0" fill="#ffffff" />
          <g id="guide" stroke="red" strokeWidth="1" display='none'>

            <image id="guideImage" x="0" y="0" width="600" height="480" />
          </g>
          <svg id="content" ref = {n => {this.content = n}} stroke="blue">
            {utils.dataToNode(this.props.allDraws.list)}
          </svg>
           <rect x1="0" y1="0" ref = {n => { this.tempContent = n}} width="0" height="0" stroke = "none" fill="#ffff00" fillOpacity= "0.3" />
           <path ref = {n => { this.tempPath = n}} d = "M 0 0 L 0 0" stroke="#ff0000" strokeOpacity="0.6" />
        </svg> 

        <SvgControlsUI parentRef={contentSvg} />
        <Ruler />
      </svg>
    );
  }
  
};

const mapStateToProps = ({ config, allDraws }) => ({ config:config.present, allDraws:allDraws.present });

SVGRoot = connect(mapStateToProps)(SVGRoot);

export default SVGRoot;

