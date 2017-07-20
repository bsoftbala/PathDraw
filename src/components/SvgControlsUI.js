import React from 'react';
import {connect} from 'react-redux';
import * as utils from '../utils';
import {editItem} from '../actions';

class SvgControlsUI extends React.Component {

  constructor(props){
    super(props);
    console.log("SvgControlsUI");
    console.dir(props);
    if(props.data){
      this.data = utils.dataToObj(props.data.d);
    }
  }

  componentDidMount(){
    console.log("componentDidMount");
    this.pt.addEventListener('mousedown', this.onMouseDown);
    this.ctrl1.addEventListener('mousedown', this.onMouseDown);
    this.ctrl2.addEventListener('mousedown', this.onMouseDown);
  }

  componentDidUpdate(){
    console.log('componentDidUpdate');
    console.dir(this.props);
    this.pt.setAttribute("display", "none");
    this.ctrl1.setAttribute("display", "none");
    this.ctrl2.setAttribute("display", "none");
    this.line1.setAttribute("display", "none");
    this.line2.setAttribute("display", "none");
    if(!this.props.data){
      return;
    }
    if(this.props.data.type != 'path'){
      return;
    }
    this.data = utils.dataToObj(this.props.data.d);
    if(this.props.segIndex == -1) {
      return;
    }

    console.dir(this.data);
    console.log('this.props.segIndex = ', this.props.segIndex);
    const obj = this.data[this.props.segIndex];
    let prevObj;
    if(this.props.segIndex != 0){
      prevObj = this.data[this.props.segIndex-1];
    }

    const {parentRef, zoom} = this.props;

    const pt = utils.toActual({x: obj.x, y: obj.y}, parentRef, zoom);
    console.dir(pt);
    utils.attr(this.pt, {cx:pt.x, cy:pt.y})

    this.pt.setAttribute("display", "block");

    if(obj.type == 'Q' || obj.type == 'C' ){
      const ctrlpt = utils.toActual({x: obj.ctx, y: obj.cty}, parentRef, zoom);
      utils.attr(this.ctrl1, {cx:ctrlpt.x, cy:ctrlpt.y, display:'block'});

      const prevPt = utils.toActual({x: prevObj.x, y: prevObj.y}, parentRef, zoom);

      utils.attr(this.line1, {x1: prevPt.x, y1:prevPt.y, x2: ctrlpt.x, y2: ctrlpt.y, display:'block'})
      if(obj.type == 'Q'){
        utils.attr(this.line2, {x1: ctrlpt.x, y1:ctrlpt.y, x2: pt.x, y2: pt.y, display:'block'})
      }else{
        const ctrlpt2 = utils.toActual({x: obj.ct2x, y: obj.ct2y}, parentRef, zoom);
        utils.attr(this.ctrl2, {cx:ctrlpt2.x, cy:ctrlpt2.y, display:'block'});

        utils.attr(this.line2, {x1: ctrlpt2.x, y1:ctrlpt2.y, x2: pt.x, y2: pt.y, display:'block'})

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
    window.document.addEventListener("mousemove", this.onMouseMove);
    window.document.addEventListener("mouseup", this.onMouseUp);
  }

  onMouseMove = e => {
    console.log('onMouseMove');
    this.current.setAttribute('cx', e.clientX - this.box.left);
    this.current.setAttribute('cy', e.clientY - this.box.top);
    this.updatePoints();
    //this.props.update(document.getElementById(this.props.id).getAttribute("d"));
  }

  updatePoints = () => {
    const {parentRef, zoom} = this.props;
    const dataPt = utils.toData({
      x: this.pt.getAttribute("cx"), 
      y: this.pt.getAttribute("cy")
    }, parentRef, zoom);

    let obj = {...this.data[this.props.segIndex]};
    obj = {...obj, x: dataPt.x, y: dataPt.y }
    console.dir(obj);

    if (obj.type == 'C' || obj.type == 'Q') {
      const ctrlPt1= utils.toData({
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
      const ctrlPt2= utils.toData({
        x: this.ctrl2.getAttribute("cx"), 
        y: this.ctrl2.getAttribute("cy")
      }, parentRef, zoom);

      obj = {...obj, ct2x: ctrlPt2.x, ct2y: ctrlPt2.y}


      this.line2.setAttribute('x1', this.ctrl2.getAttribute("cx"));
      this.line2.setAttribute('y1', this.ctrl2.getAttribute("cy"));
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
     this.props.dispatch(editItem({...this.props.data, d: dd}, this.props.index));
  }

  onMouseUp = () => {
    //console.log("mouseup");
    this.updatePoints();


    this.props.dispatch(editItem({...this.props.data, d: utils.objToData(this.data)}, this.props.index));
    //this.props.update(document.getElementById(this.props.id).getAttribute("d"));
    window.document.removeEventListener("mousemove", this.onMouseMove);
    window.document.removeEventListener("mouseup", this.onMouseUp);
  }

  render(){
    return (
    <g id = "controls" fill = "#ffdddd" fillOpacity = "0.4" stroke = "red">
             <circle ref = {n => {this.pt = n}} className = "points" cx = "40" cy = "10" r = "10" display = "none"/>
             <circle ref = {n => {this.ctrl1 = n}} className = "points" cx = "70" cy = "10" r = "10" display = "none"/>
             <circle ref = {n => {this.ctrl2 = n}} className = "points" cx = "100" cy = "10" r = "10" display = "none"/>
             <line ref = {n => {this.line1 = n}} x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
             <line ref = {n => {this.line2 = n}} x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
                  <g id = "bboxGroup" display = "none" >
                       <rect id = "bbox" strokeDasharray="5, 5"  fillOpacity = "0.2" />
                       <rect id = "resizer" fill = "#ffaaaa" width = "20" height = "20" stroke = "none"/>
                       <rect id = "rotator" fill = "#aaffaa" width = "20" height = "20" stroke = "none"/>
                  </g>
          </g> 
    )
  }
}

const mapStateToProps = ({allDraws, config}) => ({data:allDraws.list.get(allDraws.currentId), 
  index:allDraws.currentId,
  segIndex:allDraws.segIndex,
  zoom:config.zoom
});

SvgControlsUI = connect(mapStateToProps)(SvgControlsUI);

export default SvgControlsUI;