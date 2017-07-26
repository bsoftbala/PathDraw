import React from 'react';
import {connect} from 'react-redux';
import * as utils from '../utils';
import {editItem, editItemMicro} from '../actions';

import * as CanvasUtils from '../utils/canvas';

//const modify = () => {};
class SvgControlsUI extends React.Component {

  isMoveDown = false;
  constructor(props){
    super(props);
    console.log("SvgControlsUI");
    console.dir(props);
    if(props.data){
      this.data = utils.dataToObj(props.data.d);
    }
  }

  componentDidMount(){
    this.pt.addEventListener('mousedown', this.onMouseDown);
    this.ctrl1.addEventListener('mousedown', this.onMouseDown);
    this.ctrl2.addEventListener('mousedown', this.onMouseDown);
  }

  componentDidUpdate(){
    console.log("componentDidUpdate~~~~");
    if(this.isMoveDown){
      return;
    }
    if(this.props.index == -1){
      utils.attr(this.bboxGroup, {display: 'none'});
      return;
    }
    this.data = utils.dataToObj(this.props.data.d);
    this.pt.setAttribute("display", "none");
    this.ctrl1.setAttribute("display", "none");
    this.ctrl2.setAttribute("display", "none");
    this.line1.setAttribute("display", "none");
    this.line2.setAttribute("display", "none");
    if(this.props.segIndex == -1){
      this.setHigherControls();
      return;
    }
    utils.attr(this.bboxGroup, {display: 'none'});
    if(!this.props.data){
      return;
    }
    if(this.props.data.type != 'path'){
      return;
    }
    if(this.props.segIndex == -1) {
      return;
    }
    this.setLowerControls(); 
  }

  setHigherControls(){
    console.log('setHigherControls');
    const {parentRef, zoom, segIndex} = this.props;
    const rectsvg = SVG.wrap(document.getElementById(this.props.data.id)).bbox();
    console.dir(rectsvg);
    let pt = utils.toActual({x: rectsvg.x, y: rectsvg.y}, null, zoom);
    const rect = document.getElementById(this.props.data.id).getBoundingClientRect();
    //let [top, left, width, height] = [pt.y, pt.x, rectsvg.w * zoom, rectsvg.h * zoom]; //previous
    let [top, left, width, height] = [rect.top, rect.left, rect.width, rect.height];
    top -= document.getElementById('rootSvg').getBoundingClientRect().top;
    left -= document.getElementById('rootSvg').getBoundingClientRect().left;
    utils.attr(this.bbox, {x: left, y: top, width: width, height: height});
    utils.attr(this.bboxGroup, {display: 'block'});

    utils.attr(this.resizer, { transform: 'translate('+ (left + width) + ',' + (top + height) + ')' });
    utils.attr(this.rotator, { transform: 'translate('+ (left + width) + ',' + (top - 20) + ')' });
    /*
    const resizer = document.querySelector('svg #resizer');
    resizer.setAttribute('x', rect.x * window.gtw.zoom + parseInt(rootbox.getAttribute('x')) + rect.w * window.gtw.zoom);
    resizer.setAttribute('y', rect.y * window.gtw.zoom + parseInt(rootbox.getAttribute('y')) + rect.h * window.gtw.zoom);

    const rotator = document.querySelector('svg #rotator');
    rotator.setAttribute('x', rect.x * window.gtw.zoom + parseInt(rootbox.getAttribute('x')) + rect.w * window.gtw.zoom);
    rotator.setAttribute('y', rect.y * window.gtw.zoom + parseInt(rootbox.getAttribute('y')));
    */
  }

  setLowerControls(){
    const obj = this.data[this.props.segIndex];
    let prevObj;
    if(this.props.segIndex != 0){
      prevObj = this.data[this.props.segIndex-1];
    }

    const {parentRef, zoom} = this.props;

    const pt = utils.toActual2({x: obj.x, y: obj.y}, parentRef, zoom);
    console.dir(pt);
    utils.attr(this.pt, {cx:pt.x, cy:pt.y})

    this.pt.setAttribute("display", "block");

    if(obj.type == 'Q' || obj.type == 'C' ){
      const ctrlpt = utils.toActual2({x: obj.ctx, y: obj.cty}, parentRef, zoom);
      utils.attr(this.ctrl1, {cx:ctrlpt.x, cy:ctrlpt.y, display:'block'});

      const prevPt = utils.toActual2({x: prevObj.x, y: prevObj.y}, parentRef, zoom);

      utils.attr(this.line1, {x1: prevPt.x, y1:prevPt.y, x2: ctrlpt.x, y2: ctrlpt.y, display:'block'})
      if(obj.type == 'Q'){
        utils.attr(this.line2, {x1: ctrlpt.x, y1:ctrlpt.y, x2: pt.x, y2: pt.y, display:'block'})
      }else{
        const ctrlpt2 = utils.toActual2({x: obj.ct2x, y: obj.ct2y}, parentRef, zoom);
        utils.attr(this.ctrl2, {cx: ctrlpt2.x, cy: ctrlpt2.y, display: 'block'});
        utils.attr(this.line2, {x1: ctrlpt2.x, y1:ctrlpt2.y, x2: pt.x, y2: pt.y, display: 'block'})
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps");
    return;
    
    /*
    this.setState({ data: List(utils.dataToObj(nextProps.d)) });
    if(nextProps.id != this.props.id){
       setTimeout(() => this.selectFullPath(), 100); //Todo: need to remove this setTimeout
    }*/
  }


  componentWillUnmount(){
    this.pt.removeEventListener('mousedown', this.onMouseDown);
    this.ctrl1.removeEventListener('mousedown', this.onMouseDown);
    this.ctrl2.removeEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown = e => {
    console.log('onMouseDown');
    this.current = e.target;
    this.box = document.querySelector("#rootSvg").getBoundingClientRect();
    console.dir(this.box);
    this.isMoveDown = true;
    window.document.addEventListener("mousemove", this.onMouseMove);
    window.document.addEventListener("mouseup", this.onMouseUp);
  }

  onMouseMove = e => {
    console.log('onMouseMove');
    this.current.setAttribute('cx', e.clientX - this.box.left);
    this.current.setAttribute('cy', e.clientY - this.box.top);
    this.updatePoints();
    this.props.dispatch(editItemMicro({...this.props.data, d: utils.objToData(this.data)}, this.props.index));
  }

  updatePoints = () => {
    const {parentRef, zoom} = this.props;
    const dataPt = utils.toData2({
      x: this.pt.getAttribute("cx"), 
      y: this.pt.getAttribute("cy")
    }, parentRef, zoom);

    let obj = {...this.data[this.props.segIndex]};
    obj = {...obj, x: dataPt.x, y: dataPt.y }
    console.dir(obj);

    if (obj.type == 'C' || obj.type == 'Q') {
      const ctrlPt1= utils.toData2({
        x: this.ctrl1.getAttribute("cx"), 
        y: this.ctrl1.getAttribute("cy")
      }, parentRef, zoom);

      obj = {...obj, ctx: ctrlPt1.x, cty: ctrlPt1.y}
      
      this.line1.setAttribute('x2', this.ctrl1.getAttribute("cx"));
      this.line1.setAttribute('y2', this.ctrl1.getAttribute("cy"));
      this.line2.setAttribute('x2', this.pt.getAttribute("cx"));
      this.line2.setAttribute('y2', this.pt.getAttribute("cy"));
    }

    if (obj.type == 'C') {
      const ctrlPt2= utils.toData2({
        x: this.ctrl2.getAttribute("cx"), 
        y: this.ctrl2.getAttribute("cy")
      }, parentRef, zoom);

      obj = {...obj, ct2x: ctrlPt2.x, ct2y: ctrlPt2.y}


      this.line2.setAttribute('x1', this.ctrl2.getAttribute("cx"));
      this.line2.setAttribute('y1', this.ctrl2.getAttribute("cy"));

      // logic to modify the neighbouring 'C' control point to move in a smooth way
      if (false) {
        if (this.current.id == "ctrl1") {
          let prev = this.state.data.get(this.index - 1);
          if (prev && prev.type == 'C') {
            let diffX = prev.ct2x - prev.x;
            let diffY = prev.ct2y - prev.y;
            prev.ct2x = parseInt(prev.x - (this.data.ctx - prev.x));
            prev.ct2y = parseInt(prev.y - (this.data.cty - prev.y));
            this.state.data.set(this.index - 1, prev);
          }
        }
      }
    }
    if (obj.type == 'Q') {
      this.line2.setAttribute('x1', this.ctrl1.getAttribute("cx"));
      this.line2.setAttribute('y1', this.ctrl1.getAttribute("cy"));
    }
    this.data[this.props.segIndex] = obj;
    console.dir(this.data);

    let dd = utils.objToData(this.data);
    document.getElementById(this.props.data.id).setAttribute("d", dd);
     //this.props.dispatch(editItem({...this.props.data, d: dd}, this.props.index)); 
  }

  onMouseUp = () => {
    //console.log("mouseup");
    this.updatePoints();

    this.isMoveDown = false;
    this.props.dispatch(editItem({...this.props.data, d: utils.objToData(this.data)}, this.props.index));
    
    window.document.removeEventListener("mousemove", this.onMouseMove);
    window.document.removeEventListener("mouseup", this.onMouseUp);
  }

  moveItem = (e) => {
    const elem = document.getElementById(this.props.data.id);
    const {parentRef, zoom} = this.props;
    const offset = utils.toData({x: e.clientX, y: e.clientY}, parentRef, zoom);

    const onMove = (x,y) => {
      var newpt = utils.toData({x, y}, parentRef, zoom);
      utils.attr(elem, {transform: `translate(${newpt.x - offset.x},${newpt.y - offset.y})`});
    }

    const onUp = (x,y) => {
      const transform = elem.getAttribute('transform');
      if(!transform){
        return;
      }
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)$/);
      const data = utils.translate(this.data, parseInt(arr[1]), parseInt(arr[2]));
      const d = utils.objToData(data);
      elem.removeAttribute('transform');
      this.props.dispatch(editItem({...this.props.data, d}, this.props.index));
    }
    CanvasUtils.modify(e, this.resizer, this.bboxGroup, onMove, onUp);
  }

  resizeItem = (e) => {
    const elem = document.getElementById(this.props.data.id);
    const {parentRef, zoom} = this.props;
    const offset = utils.toData({x: e.clientX, y: e.clientY}, parentRef, zoom);

    const rect = elem.getBoundingClientRect();
    const origWidth = rect.width/zoom;
    const origHeight = rect.height/zoom;
    var elemPt = utils.toData({x: rect.left, y: rect.top}, parentRef, zoom);

    const onMove = (x,y) => {
      var newpt = utils.toData({x, y}, parentRef, zoom);
      const newWidth = parseInt(rect.width/zoom + newpt.x - offset.x);
      const newHeight = parseInt(rect.height/zoom + newpt.y - offset.y);

      let str = `translate(${elemPt.x},${elemPt.y}) `;
      str += `scale(${newWidth / origWidth},${newHeight / origHeight}) `;
      str += `translate(${elemPt.x * -1},${elemPt.y * -1}) `;
      utils.attr(elem, {transform: str});
    }

    const onUp = (x,y) => {
      const transform = elem.getAttribute('transform');
      if(!transform){
        return;
      }
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)\s+scale\(([0-9\.\-]+)\,([0-9\.\-]+)\)/);
      const data = utils.resize(this.data, Number(arr[1]), Number(arr[2]), Number(arr[3]), Number(arr[4]));
      const d = utils.objToData(data);
      elem.removeAttribute('transform');
      this.props.dispatch(editItem({...this.props.data, d}, this.props.index));
    }

    CanvasUtils.modify(e, this.resizer, this.bboxGroup, onMove, onUp);
  }

  rotateItem = (e) => {
    const elem = document.getElementById(this.props.data.id);
    const {parentRef, zoom} = this.props;
    const offset = utils.toData({x: e.clientX, y: e.clientY}, parentRef, zoom);
    const rect = elem.getBoundingClientRect();

    const onMove = (x,y) => {
      /*
      let angle = Math.atan2((y - this.box.top) - this.moveBox.y - this.moveBox.height / 2, 
        (e.clientX - this.box.left) - this.moveBox.x - this.moveBox.width / 2); */
      let angle = Math.atan2(y  - rect.top - rect.height / 2, x  - rect.left - rect.width / 2);
      angle = parseInt(angle * 180 / Math.PI);
      angle += 45;

      var newpt = utils.toData({x, y}, parentRef, zoom);
      var elemPt = utils.toData({x: rect.left, y: rect.top}, parentRef, zoom);
      elemPt = Object.assign(elemPt, {width: rect.width/zoom, height: rect.height/zoom });
      let str = `translate(${elemPt.x + elemPt.width / 2},${elemPt.y + elemPt.height / 2}) `;
      str += `rotate(${angle}) `;
      str += `translate(${(elemPt.x + elemPt.width / 2) * -1},${(elemPt.y + elemPt.height / 2) * -1}) `;
      elem.setAttribute('transform', str);
    }

    const onUp = (x,y) => {
      const transform = elem.getAttribute('transform');
      if(!transform){
        return;
      }
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)\s+rotate\(([0-9\.\-]+)\)/);
      const data = utils.rotate(this.data, Number(arr[1]), Number(arr[2]), Number(arr[3]));
      const d = utils.objToData(data);
      elem.removeAttribute('transform');
      this.props.dispatch(editItem({...this.props.data, d}, this.props.index));
    } 
    CanvasUtils.modify(e, this.rotator, this.bboxGroup, onMove, onUp);
  }

  render(){
    return (
    <g id = "controls" fill = "#ffdddd" fillOpacity = "0.4" stroke = "red">
             <circle ref = {n => {this.pt = n}} className = "points" cx = "40" cy = "10" r = "10" display = "none"/>
             <circle ref = {n => {this.ctrl1 = n}} className = "points" cx = "70" cy = "10" r = "10" display = "none"/>
             <circle ref = {n => {this.ctrl2 = n}} className = "points" cx = "100" cy = "10" r = "10" display = "none"/>
             <line ref = {n => {this.line1 = n}} x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
             <line ref = {n => {this.line2 = n}} x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
              <g id = "bboxGroup" ref = {n => {this.bboxGroup = n}} >
                  <rect id = "bbox" ref = {n => {this.bbox = n}} onMouseDown = {this.moveItem} strokeDasharray="5, 5"  fillOpacity = "0.5" />
                  <path id = "resizer" ref = {n => {this.resizer = n}}  onMouseDown = {this.resizeItem} 
                    d="M 0 0 L 20 0 L 20 20 L 0 20 L 0 0 M 15 5 L 5 15 M 8 5 L 15 5 L 15 12 M 5 8 L 5 15  L 12 15 L 5 15" 
                    stroke="#ff6666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill = "white"></path>

                  <path id = "rotator" ref = {n => {this.rotator = n}} onMouseDown = {this.rotateItem}  
                    d="M 0 0 L 20 0 L 20 20 L 0 20 L 0 0 M 5 8 C 1 18 22 20 13 6 C 22 20 1 18 5 8  M 10 9 L 11 4  L 16 5 " 
                    stroke="#ff6666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill = "white" ></path>
              </g>
          </g> 
    )
  }
}

const mapStateToProps = ({allDraws, config}) => ({data:allDraws.present.list.get(allDraws.present.currentId), 
  index:allDraws.present.currentId,
  segIndex:allDraws.present.segIndex,
  zoom:config.present.zoom
});

SvgControlsUI = connect(mapStateToProps)(SvgControlsUI);

export default SvgControlsUI;