import React, { Component } from 'react';
import { render } from 'react-dom';
import { List } from 'immutable';

import PathEditor from './PathEditor';

class Editor extends Component {
  constructor() {
    super();
    this.state = {
      type: '',
      loopType: 'none',
      loopInfo: {
        count: 5,
        offset: 100,
        step: 20
      }
    };
    this.defaultLoopInfo = {
      loop: {
        count: 5,
        offset: 100,
        step: 20
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
    this.loopTypeChange = this.loopTypeChange.bind(this);
    this.update = this.update.bind(this);
    this.updatePath = this.updatePath.bind(this);
    this.updateLoopInfo = this.updateLoopInfo.bind(this);

    this.editItem = this.editItem.bind(this);


    this.selectDraw = this.selectDraw.bind(this);

    this.insert = this.insert.bind(this);
  }


  updateLoopInfo(e) {
    const loopInfo = { ...this.state.loopInfo };
    loopInfo[e.target.id] = e.target.value;
    this.setState({ loopInfo }, () => {
      // this.props.showPreview(this.state);
      this.props.update(this.state);
      document.getElementById(this.state.id).setAttribute(e.target.id, e.target.value);
    });
  }

  update(e) {
    let value = e.target.value;
    // if(e.target.id != 'd' && !(value.trim() == 'x' && this.state.loopType != 'none')){
    if (e.target.id != 'd' && value.trim() != 'x' && value.trim() != 'y') {
      value = Number(value);
      if (isNaN(value)) {
        return;
      }
    }
    // document.getElementById(this.state.id).setAttribute(e.target.id, e.target.value);
    this.setState({
      [e.target.id]: value },
      () => {
        this.props.update(this.state);
      });
  }

  updatePath(d) {
    // console.dir("d" + d);
    this.state.d = d;
    this.props.update(this.state);
  }

  loopTypeChange(e) {
    this.setState({
      loopType: e.target.value,
      loopInfo: this.defaultLoopInfo[e.target.value]
    },
    () => this.props.update(this.state)
    );
  }


  selectDraw(obj) {
    console.log(obj.type);
    switch (obj.type) {
      case 'path':
        this.setState({
          current: obj.id,
          data: List(this.dataToObj(obj.d))
        });
        break;
    }
  }

  componentDidMount() {
    setTimeout(() => {
      document.getElementById('editItemPanel').addEventListener('editItem', this.editItem);
    }, 10);
  }

  componentWillUnmount() {
    document.getElementById('editItemPanel').removeEventListener('editItem', this.editItem);
  }

  editItem(e) {
    document.getElementById('pt2').setAttribute('display', 'none');
    document.getElementById('ctrl1').setAttribute('display', 'none');
    document.getElementById('ctrl2').setAttribute('display', 'none');
    document.getElementById('line1').setAttribute('display', 'none');
    document.getElementById('line2').setAttribute('display', 'none');

    if (!e.detail) {
      document.querySelector('.editWrapper').style.display = 'none';
    } else {
      document.querySelector('.editWrapper').style.display = 'block';
      const obj = e.detail;
      if (!obj.loopType) {
        obj.loopType = 'none';
        obj.loopInfo = {};
      }
      this.setState({ ...obj });
    }
  }

  insert(obj) {
    const node = document.querySelector('svg #tempContent');
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    let str;


    this.setState({ allDraws: this.state.allDraws.push({ type: obj.type, ...obj.info }) });
    // render(str, node);
  }

  render() {
    let input = '';
    switch (this.state.type) {
      case 'line':
        input = (
          <div className="lineWidth">
            <label >X1 : </label><input className="form-control" id="x1" type="text" value={this.state.x1} onChange={this.update} />
            <label className="line">Y1 : </label><input className="form-control" id="y1" type="text" value={this.state.y1} onChange={this.update} />
            <div>
              <label >X2 : </label><input className="form-control " id="x2" type="text" value={this.state.x2} onChange={this.update} />
              <label className="line1">Y2 : </label><input className="form-control " id="y2" type="text" value={this.state.y2} onChange={this.update} />
            </div>
          </div>
        );
        break;
      case 'circle':
        input = (
          <div className="circleWidth">
            <label>centerX : </label><input className="form-control" id="cx" type="text" value={this.state.cx} onChange={this.update} />
            <label className="circle">centerY : </label><input className="form-control" id="cy" type="text" value={this.state.cy} onChange={this.update} />
            <label className="circle">radius : </label><input className="form-control" id="r" type="text" value={this.state.r} onChange={this.update} />
          </div>
        );
        break;
      case 'ellipse':
        input = (
          <div className="ellipseWidth">
            <label className="ellipse" >centerX : </label><input className="form-control" id="cx" type="text" value={this.state.cx} onChange={this.update} />
            <label className="ellipse">centerY : </label><input className="form-control" id="cy" type="text" value={this.state.cy} onChange={this.update} />
            <div>
              <label className="ellipse1" >radiusX : </label><input className="form-control" id="rx" type="text" value={this.state.rx} onChange={this.update} />
              <label className="ellipse1">radiusY : </label><input className="form-control" id="ry" type="text" value={this.state.ry} onChange={this.update} />
            </div>
          </div>
        );
        break;
      case 'path':
        // console.log("this.state.d", this.state.d);
        input = (<PathEditor update={this.update} d={this.state.d} id={this.state.id} update={this.updatePath} />);
        break;
    }

    let loopDom = '';
    // console.log("this.state.loopType = " + this.state.loopType);
    switch (this.state.loopType) {
      case 'loop':
        loopDom = (
          <div className="loopInfo loopCount">
            <label>Loop Count:</label>
            <input className="form-control" type="number" id="count" value={this.state.loopInfo.count} onChange={this.updateLoopInfo} />
            <label>Offset :</label>
            <input className="form-control" type="number" id="offset" value={this.state.loopInfo.offset} onChange={this.updateLoopInfo} />

            <label >Step :</label>
            <input className="form-control" type="number" id="step" value={this.state.loopInfo.step} onChange={this.updateLoopInfo} />

          </div>
        );
        break;
      case '2dLoop':
        loopDom = (
          <div className="loopInfo ">
            <label>Loop Count:</label>
            <input className="form-control" type="number" id="count" value={this.state.loopInfo.count} onChange={this.updateLoopInfo} />
            <label>Offset :</label>
            <input className="form-control" type="number" id="offset" value={this.state.loopInfo.offset} onChange={this.updateLoopInfo} />
            <label>Step :</label>
            <input className="form-control" type="number" id="step" value={this.state.loopInfo.step} onChange={this.updateLoopInfo} />

            <label>Loop Count Y:</label>
            <input className="form-control" type="number" id="county" value={this.state.loopInfo.county} onChange={this.updateLoopInfo} />
            <label>Offset Y:</label>
            <input className="form-control" type="number" id="offsety" value={this.state.loopInfo.offsety} onChange={this.updateLoopInfo} />

            <label>Step Y:</label>
            <input className="form-control" type="number" id="stepy" value={this.state.loopInfo.stepy} onChange={this.updateLoopInfo} />
          </div>
        );
        break;
      case 'circular':
        loopDom = (
          <div className="loopInfo circleXY">
            <label>Count:</label>
            <input className="form-control" type="number" id="count" value={this.state.loopInfo.count} onChange={this.updateLoopInfo} />
            <label>Center X :</label>
            <input className="form-control" type="number" id="centerX" value={this.state.loopInfo.centerX} onChange={this.updateLoopInfo} />

            <label>Center Y :</label>
            <input className="form-control" type="number" id="centerY" value={this.state.loopInfo.centerY} onChange={this.updateLoopInfo} />

          </div>
        );
        break;

    }
    return (
      <div className="editWrapper" id="editItemPanel">
        <header onMouseDown={this.props.panelDragStart}>
          <h4> Editor <i onClick={this.props.hidePanel} className="fa fa-times" aria-hidden="true" /> </h4>
        </header>
        <div>
          <label >Loop Type : </label>
          <select className="form-control" value={this.state.loopType} onChange={this.loopTypeChange}>
            <option value="">None </option>
            <option value="loop">Loop </option>
            {/*
              <option value = "2dLoop"> 2D Loop </option> */}
            <option value="circular" > Circular </option>
          </select>
        </div>
        {loopDom}
        <div className="inputWrapper2">
          {input}
        </div>
      </div>
    );
  }
}

export default Editor;
