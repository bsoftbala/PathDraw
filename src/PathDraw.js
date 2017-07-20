import React, { Component } from 'react';
import { render } from 'react-dom';
import { List } from 'immutable';
import { CompactPicker } from 'react-color';
import Vivus from 'vivus';


import * as utils from './utils';
import Editor from "./Editor";
import Guide from './Guide';

class PathMath extends Component {
  constructor() {
    super();
    this.counter = 10;
    this.state = {
      width: 600,
      height: 480,
      current: -1,
      popup: "",
      allDraws: List.of({type:"path", id:'rethna', d:'M 100 100 L 200 100 L 200 200 L 100 200 L 100 100'})
    }

    window.gtw = {};
    window.gtw.width = 600;
    window.gtw.height = 480;
    window.gtw.zoom = 1;

    
    this.hidePanel = this.hidePanel.bind(this);
    this.showPanel = this.showPanel.bind(this);
    this.setDimension = this.setDimension.bind(this);
    this.clearAll = this.clearAll.bind(this);
    this.remove = this.remove.bind(this);

    this.panelDragStart = this.panelDragStart.bind(this);
    this.panelDragMove = this.panelDragMove.bind(this);
    this.panelDragStop = this.panelDragStop.bind(this);

    this.setZoom = this.setZoom.bind(this);
    this.insertElement = this.insertElement.bind(this);

    this.updateElement = this.updateElement.bind(this);

    this.strokeWidthChange = this.strokeWidthChange.bind(this);
    this.strokeColorChange = this.strokeColorChange.bind(this);
    this.fillColorChange = this.fillColorChange.bind(this);
    this.changeStackOrder = this.changeStackOrder.bind(this);
    this.updateSource = this.updateSource.bind(this);
    this.animate = this.animate.bind(this);
  }

  animate(){
    new Vivus("content", {type:'oneByOne'})
  }



  updateSource(){
    let dom = document.createElement("DIV");
    dom.innerHTML = document.querySelector("#sourcePanel .source").value;
    let list = utils.nodeToData(dom.querySelector("svg"));
    console.dir(list.toJS());
    this.setState({allDraws:list});
    this.hidePanel("sourcePanel");
  }

  changeStackOrder(e){
    let allDraws = this.state.allDraws;
    let item = allDraws.get(this.state.current);
    if(e.target.id == "upStackOrder"){
      if(this.state.current != 0){
        allDraws = allDraws.remove(this.state.current);
        this.state.current--;
        allDraws = allDraws.splice(this.state.current, 0, item);
        this.setState({allDraws});
      }   
    }else if(e.target.id == "downStackOrder"){
      if(this.state.current !== allDraws.size-1){
        allDraws = allDraws.remove(this.state.current);
        this.state.current++;
        allDraws = allDraws.splice(this.state.current, 0, item);
        this.setState({allDraws});
      }
    }
    let selected = document.querySelector("#allDrawsPanel .selected");
    if (selected) {
      selected.classList.remove("selected");
    }
    document.querySelector("#allDrawsPanel #draw~" + this.state.current).classList.add("selected");
  }

  strokeColorChange(color){
    let obj = this.state.allDraws.get(this.state.current);
    obj.stroke = color.hex;
    this.setState({allDraws: this.state.allDraws.set(this.state.current, obj)});
  }

  fillColorChange(color){
    let obj = this.state.allDraws.get(this.state.current);
    obj.fill = color.hex;
    this.setState({allDraws: this.state.allDraws.set(this.state.current, obj)});
  }

  strokeWidthChange(e){
    let val = e.target.value;
    if(val > 10){
      val = 10;
    }else if(val < 1){
      val = 1;
    }
    let obj = this.state.allDraws.get(this.state.current);
    obj.strokeWidth = val;
    this.setState({allDraws: this.state.allDraws.set(this.state.current, obj)});
  }

  updateElement(obj){
    let allDraws = this.state.allDraws.set(this.state.current, obj);
    //console.dir(allDraws.toJS());
    this.setState({allDraws});
  }

  insertElement(e){
    let info;
    console.log("typeChange", e.target.value);

    let type = document.getElementById("insertType").value;
    switch(type){
      case "line":
        info = {x1:100, y1 : 100, x2:200, y2:100, id : 'line' + this.counter};
        break;
      case "circle":
        info = {cx:100, cy : 100, r:50, id : 'circle' + this.counter};
        break;
      case "ellipse":
        info = {cx:100, cy : 100, rx:50, ry:80, id : 'ellipse' + this.counter};
        break;
      case "path":
        info = {d: 'M 100 100 C 100 200 200 200 200 100', id : 'path' + this.counter};
        break;
    }
    this.counter++;
    info.type = type;
    this.setState({
      allDraws: this.state.allDraws.push(info)
    })
  }


  setZoom(e){
    document.getElementById('guidePanel').dispatchEvent(new CustomEvent('onZoom',{detail:{id:e.target.id}} ));
  }

  


  hidePanel(e) {
    let id;
    if(typeof e == "string"){
      id = e;
    }else{
      id = e.currentTarget.parentNode.parentNode.parentNode.id;
    }
    document.getElementById(id).style.display = "none";
  }

  showPanel(e) {
    switch (e.currentTarget.id) {
      case "showProperties":
        document.getElementById("propertiesPanel").style.display = "block";
        break;
      case "showSource":
        this.populateSource();
        document.getElementById("sourcePanel").style.display = "block";
        break;
      case "showGuide":
        document.getElementById("guidePanel").style.display = "block";
        break;
      case "showDrawList":
        document.getElementById("allDrawsPanel").style.display = "block";
        break;
      case "unitDraw":
        let id = e.target.id;
        id = parseInt(id.substr(id.indexOf('~') + 1));
        console.log("id = " + id);
        this.state.current = id;
        let selected = e.target.parentNode.querySelector(".selected");
        if (selected) {
          selected.classList.remove("selected");
        }
        e.target.classList.add("selected");

        if (isNaN(id)) {
          return;
        }
        //Editor.selectDraw(this.state.allDraws.get(id));

        document.getElementById('editItemPanel').dispatchEvent(new CustomEvent('editItem',{detail:{...this.state.allDraws.get(id)}} ));
        //document.getElementById("pathEditorPanel").style.display = "block";
        break;
    }
  }

  populateSource(){
    let root = document.querySelector("#contentSvg #content");
    let str = "<svg width = '" + this.state.width  + "' height = '" + this.state.height + "' >" + "\n";
    for(let i = 0; i < root.childNodes.length; i++){
      if(root.childNodes[i].nodeType == 1){
        str += root.childNodes[i].outerHTML  + "\n";
      }
    }
    str += "</svg>";
    document.querySelector("#sourcePanel .source").value = str;
  }

  panelDragStart(e) {
    console.log("panelDragStart");
    e.preventDefault();
    this.dragPanel = e.currentTarget.parentNode;
    console.dir(this.dragPanel);
    this.dragOffset = {
      x: e.clientX - this.dragPanel.getBoundingClientRect().left,
      y: e.clientY - this.dragPanel.getBoundingClientRect().top,
    }
    document.addEventListener("mousemove", this.panelDragMove);
    document.addEventListener("mouseup", this.panelDragStop);
  }

  panelDragMove(e) {
    let x = e.clientX - this.dragOffset.x;
    if (x < this.rootBox.left) x = this.rootBox.left;
    if (x > this.rootBox.left + this.rootBox.width - this.dragPanel.getBoundingClientRect().width) {
      x = this.rootBox.left + this.rootBox.width - this.dragPanel.getBoundingClientRect().width;
    }

    let y = e.clientY - this.dragOffset.y + window.scrollY;
    if (y < this.rootBox.top) y = this.rootBox.top;
    if (y > this.rootBox.top + this.rootBox.height - this.dragPanel.getBoundingClientRect().height) {
      y = this.rootBox.top + this.rootBox.height - this.dragPanel.getBoundingClientRect().height;
    }
    this.dragPanel.style.left = x + "px";
    this.dragPanel.style.top = y + "px";
  }

  panelDragStop(e) {
    console.log("panelDragStop");
    document.removeEventListener("mousemove", this.panelDragMove);
    document.removeEventListener("mouseup", this.panelDragStop);
  }

  clearAll() {
    document.getElementById('propertiesPanel').style.display = "none";
    this.setState({allDraws:List.of()});
    document.getElementById('editItemPanel').dispatchEvent(new CustomEvent('editItem'));
  }

  remove(){
    this.setState({allDraws:this.state.allDraws.delete(this.state.current)});
    document.getElementById('editItemPanel').dispatchEvent(new CustomEvent('editItem'));
  }

  setDimension(e) {
    console.log(" e.target.value = ", e.target.value);
    let val = e.target.value;
    if(val < 50){
      val = 50;
    }else if(val > 1000){
      val= 1000;
    }
    switch (e.target.id) {
      case 'svgWidth':
        this.setState({ width: val })
        window.gtw.width = val;
        break;
      case 'svgHeight':
        this.setState({ height: val })
         window.gtw.height = val;
        break;
    }
    document.getElementById('guidePanel').dispatchEvent(new CustomEvent('onZoom',{detail:{id:e.target.id}} ));
  }

  componentDidMount() {
    this.box = document.querySelector("svg").getBoundingClientRect();
    setTimeout(() => {
      this.rootBox = document.querySelector(".pathMathWrapper").getBoundingClientRect();
      console.dir(this.rootBox);
    }, 1000)
    

  }

  render() {
    let cObj = null;
    if(this.state.current != -1){
      cObj = this.state.allDraws.get(this.state.current);
    }
    return (
      <div className = "pathMathWrapper">
          <div className = "svgColumn">
            <div className = "toolsWrapper">
          {/*
              <button className="btn btn-primary"><i className="fa fa-floppy-o"></i> Save</button>
              <button className="btn btn-primary"><i className="fa fa-download" aria-hidden="true"></i> Save As Copy </button>
             */}
             

              <select className ="form-control" id = "insertType">
              <option value = "line">Line </option>
              <option value = "circle"> Circle </option>
              <option value = "ellipse" > Ellipse </option>
              <option value = "path"> Path </option>
            </select>

              <button className="btn btn-primary " onClick = {this.insertElement} id = "showInsert"><i className="fa fa-level-down" aria-hidden="true"></i> Insert </button>
              <span className = "divider" />
               <button className="btn btn-primary" onClick = {this.clearAll}><i className="fa fa-trash" aria-hidden="true"></i> Clear All </button>
              <button className="btn btn-primary" onClick = {this.remove}><i className="fa fa-eraser" aria-hidden="true"></i> Remove </button>
              <button className="btn btn-primary" onClick = {this.showPanel} id = "showDrawList"><i className="fa fa-list" aria-hidden="true"></i> Draw List </button>
              <button className="btn btn-primary" onClick = {this.showPanel} id = "showSource"><i className="fa fa-file-code-o" aria-hidden="true"></i> Source </button>
              <button className="btn btn-primary" onClick = {this.showPanel} id = "showGuide"><i className="fa fa-book" aria-hidden="true"></i> Guide </button>
              <button className="btn btn-primary" onClick = {this.showPanel} id = "showProperties"><i className="fa fa-sliders" aria-hidden="true"></i> Properties </button>
              <span className = "divider" />
              <button className="btn btn-primary" id = "zoomIn" onClick = {this.setZoom}><i className="fa fa-search-plus" aria-hidden="true"></i> Zoom In </button>
              <button className="btn btn-primary" id = "zoomOut" onClick = {this.setZoom}><i className="fa fa-search-minus" aria-hidden="true"></i> Zoom Out </button>
              <button className="btn btn-primary" id = "zoomFit" onClick = {this.setZoom}><i className="fa fa-clone" aria-hidden="true"></i> Exact Fit </button>
              <button className="btn btn-primary" id = "animateBtn" onClick = {this.animate}><i className="fa fa-play" aria-hidden="true"></i> Animate </button>
            </div>
            <svg id = "rootSvg" width = {window.innerWidth-1} height = {window.innerHeight-20}  strokeWidth = "2" stroke = "#c9c9ca" fill = "none"  >
                <svg id = "contentSvg"  width = {this.state.width} height = {this.state.height} x = {(window.innerWidth - this.state.width)/2 +10} y = {(window.innerHeight - this.state.height)/2 + 10}>
                  <rect  width = {this.state.width} height = {this.state.height} x = "0" y = "0" fill = "#ffffff" />
                  <g id = "guide" stroke = "red" strokeWidth = "1">
                  
                  <path d="M 0 180 C 13 125 49 91 121 101 " ></path>
                  <path d="M 0 180 C 69 151 117 134 83 105 " ></path>
                  <path d="M 123 100 C 116 209 182 215 185 180 " ></path>
                  <path d="M 123 100 C 123 212 126 214 186 180" ></path>
                 
                  <path d="M 0 125 C 63 161 113 174 88 122" ></path>
                  <path d="M 136 99 Q 159 113 178 124" ></path>
                  <path d="M 0 114 C 46 112 54 93 98 101 " ></path>
                  <path d="M 136 99 Q 153 115 180 114" ></path>

                  <image id = "guideImage" x = "0" y = "0" width = "600" height = "480" /> 
                </g>
                  <svg id = "content" stroke="blue">
                  {utils.dataToNode(this.state.allDraws)}
                  </svg>
                </svg>
                <g id = "tempContent" stroke = "red">

                </g>
                <g id = "controls" fill = "#ffdddd" fillOpacity = "0.4" stroke = "red">
                  <circle id = "pt1" className = "points" cx = "10" cy = "10" r = "10" display = "none"/>
                  <circle id = "pt2" className = "points" cx = "40" cy = "10" r = "10" display = "none"/>
                  <circle id = "ctrl1" className = "points" cx = "70" cy = "10" r = "10" display = "none"/>
                  <circle id = "ctrl2" className = "points" cx = "100" cy = "10" r = "10" display = "none"/>
                  <line id = "line1" x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
                  <line id = "line2" x1 = '0' y1 = '0' x2 = '0' y2 = '0' strokeDasharray="5, 5" display = "none"/>
                  <g id = "bboxGroup" display = "none" >
                  <rect id = "bbox" strokeDasharray="5, 5"  fillOpacity = "0.2" />
                  <rect id = "resizer" fill = "#ffaaaa" width = "20" height = "20" stroke = "none"/>
                  <rect id = "rotator" fill = "#aaffaa" width = "20" height = "20" stroke = "none"/>
                  </g>
                </g>
                <g id = "guides">     
                  <g id = "vGuideLines" stroke = "#00ff00">
                  </g>
                  <g id = "hGuideLines" stroke = "#00ff00">
                  </g>
                  <rect id = "rulerTop" x = "0" y = "0" width = {window.innerWidth - 5} height = "25" fill = "#ffff99" stroke = "none"/>
                  <rect id = "rulerLeft" x = "0" y = "25" width = "25" height = {window.innerHeight - 20} fill = "#ffff99" stroke = "none"/>
                  <path d = "" stroke = "#777777" id = "rulerLines" />
                </g>
                 
              </svg>
          <div className = "propertiesWrapper" id = "propertiesPanel">
              <header onMouseDown = {this.panelDragStart}>
                <h4> Properties <i onClick = {this.hidePanel} className="fa fa-times" aria-hidden="true"></i> </h4>
              </header>
              <div className="propertyWidth">
                <label> Width : </label>
                <input className ="form-control" id = "svgWidth" value = {this.state.width} onChange = {this.setDimension} />
                <label> Height : </label>
                <input className ="form-control" id = "svgHeight" value = {this.state.height} onChange = {this.setDimension} /> <br/>
              </div>
              <div className="stroke">
                <label> Stroke Color : </label>
                <CompactPicker  onChangeComplete={this.strokeColorChange} style = {{display:"inline-block"}}/><br/>
                <label> Stroke Weight : </label>
                <input className ="form-control"  type = "number" value = {(cObj && cObj.strokeWidth) || 1} onChange = {this.strokeWidthChange} /><br/>
              </div>
              <div>
                <label> Fill Color : </label>
                <CompactPicker   onChangeComplete={this.fillColorChange} style = {{display:"inline-block"}}/>
              </div>
          </div>
          <div className = "allDrawingList" id = "allDrawsPanel">
            <header onMouseDown = {this.panelDragStart}>
              <h4> All Drawings  
              <i onClick = {this.hidePanel} className="fa fa-times" aria-hidden="true"></i>
              <i onClick = {this.changeStackOrder} id = "downStackOrder" className="fa fa-arrow-down" aria-hidden="true"></i>
              <i onClick = {this.changeStackOrder} id = "upStackOrder" className="fa fa-arrow-up" aria-hidden="true"></i>
              </h4>
              
            </header>
            <ol id = "unitDraw" onClick = {this.showPanel} >
            {
              this.state.allDraws.map((item, i) => <li key = {i} id = {"draw~" + i}> {item.type} | {item.id} </li>)
            }
            </ol>
          </div>
          <Editor update = {this.updateElement} hidePanel = {this.hidePanel} panelDragStart = {this.panelDragStart} />

          <div id = "sourcePanel" >
            <header onMouseDown = {this.panelDragStart}>
                <h4> Source  <i onClick = {this.hidePanel} className="fa fa-times" aria-hidden="true"></i></h4>
              </header>
              <textarea className = "source">

              </textarea>
              <div className = "footer">
                <button className = "btn btn-primary" onClick = {this.updateSource} > Update </button>
              </div>
          </div>
          <Guide hidePanel = {this.hidePanel} panelDragStart = {this.panelDragStart} />
        </div>
      </div>
    )
  }
}

export default PathMath;
