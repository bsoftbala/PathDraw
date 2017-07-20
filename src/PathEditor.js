import React, { Component } from 'react';
import { render } from 'react-dom';
import { List } from 'immutable';
import * as utils from './utils';
import SVG from 'svgjs';

SVG.wrap = function (node) {
  /* Wrap an existing node in an SVG.js element. This is a slight hack
   * because svg.js does not (in general) provide a way to create an
   * Element of a specific type (eg SVG.Ellipse, SVG.G, ...) from an
   * existing node and still call the Element's constructor.
   *
   * So instead, we call the Element's constructor and delete the node
   * it created (actually, just leaving it to garbage collection, since it
   * hasn't been inserted into the doc yet), replacing it with the given node.
   *
   * Returns the newly created SVG.Element instance.
   */
  if (node.length) node = node[0]; // Allow using with or without jQuery selections
  const element_class = capitalize(node.nodeName);
  try {
    var element = new SVG[element_class]();
  } catch (e) {
    throw (`No such SVG type '${element_class}'`);
  }
  element.node = node;
  return element;
};


function capitalize(string) {
  if (!string) return string;
  return string[0].toUpperCase() + string.slice(1);
}


class PathEditor extends Component {
  constructor(props) {
    super(props);
    this.index = -1; // move,resize, rotate mode
    this.state = {
      data: List(utils.dataToObj(this.props.d))
    };
    console.log('this.props.d', this.props.d);
    this.placeCtrls = this.placeCtrls.bind(this);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.startDraw = this.startDraw.bind(this);
    this.doDraw = this.doDraw.bind(this);
    this.stopDraw = this.stopDraw.bind(this);

    this.onKeyPress = this.onKeyPress.bind(this);

    this.selectFullPath = this.selectFullPath.bind(this);

    this.onMoveKeyDown = this.onMoveKeyDown.bind(this);
    this.onMoveKeyUp = this.onMoveKeyUp.bind(this);
  }

  onMoveKeyDown(e) {
    if (this.index != -1) {
      return;
    }
    if (!(e.keyCode >= 37 && e.keyCode <= 40)) {
      return;
    }
    if (!this.offset) {
      this.offset = { x: 0, y: 0 };
    }
    switch (e.keyCode) {
      case 37:
        if (e.shiftKey) {
          this.offset.x -= 5;
        } else {
          this.offset.x--;
        }
        break;
      case 38:
        if (e.shiftKey) {
          this.offset.y -= 5;
        } else {
          this.offset.y--;
        }
        break;
      case 39:
        if (e.shiftKey) {
          this.offset.x += 5;
        } else {
          this.offset.x++;
        }
        break;
      case 40:
        if (e.shiftKey) {
          this.offset.y += 5;
        } else {
          this.offset.y++;
        }
        break;
    }
    document.getElementById(this.props.id).setAttribute('transform', `translate(${this.offset.x},${this.offset.y})`);
  }

  onMoveKeyUp(e) {
    if (this.index != -1) {
      return;
    }
    if (!(e.keyCode >= 37 && e.keyCode <= 40)) {
      return;
    }

    const data = utils.translate(this.state.data, this.offset.x, this.offset.y);
    const d = utils.objToData(data);
    const path = document.getElementById(this.props.id);
    path.removeAttribute('transform');
    path.setAttribute('d', d);
    this.props.update(d);
    this.offset = null;
    this.selectFullPath();
  }

  // we should not set state based on props. In order to override that..

  selectFullPath(e) {
    this.index = -1;
    const rect = SVG.wrap(document.getElementById(this.props.id)).bbox();
    const draw = SVG('rootSvg');

    const bbox = document.querySelector('svg #bbox');
    const rootbox = document.querySelector('svg#contentSvg');
    bbox.setAttribute('x', rect.x * window.gtw.zoom + parseInt(rootbox.getAttribute('x')));
    bbox.setAttribute('y', rect.y * window.gtw.zoom + parseInt(rootbox.getAttribute('y')));
    bbox.setAttribute('width', rect.w * window.gtw.zoom);
    bbox.setAttribute('height', rect.h * window.gtw.zoom);
    document.getElementById('bboxGroup').setAttribute('display', 'block');

    this.pt2.setAttribute('display', 'none');
    this.ctrl1.setAttribute('display', 'none');
    this.ctrl2.setAttribute('display', 'none');
    this.line1.setAttribute('display', 'none');
    this.line2.setAttribute('display', 'none');

    const resizer = document.querySelector('svg #resizer');
    resizer.setAttribute('x', rect.x * window.gtw.zoom + parseInt(rootbox.getAttribute('x')) + rect.w * window.gtw.zoom);
    resizer.setAttribute('y', rect.y * window.gtw.zoom + parseInt(rootbox.getAttribute('y')) + rect.h * window.gtw.zoom);

    const rotator = document.querySelector('svg #rotator');
    rotator.setAttribute('x', rect.x * window.gtw.zoom + parseInt(rootbox.getAttribute('x')) + rect.w * window.gtw.zoom);
    rotator.setAttribute('y', rect.y * window.gtw.zoom + parseInt(rootbox.getAttribute('y')));
  }

  componentDidMount() {
    document.getElementById('guidePanel').addEventListener('onZoom', this.adjustZoom);

    document.getElementById('contentSvg').addEventListener('mousedown', this.startDraw);

    document.getElementById('bbox').addEventListener('mousedown', this.startDraw);
    document.getElementById('resizer').addEventListener('mousedown', this.startDraw);
    document.getElementById('rotator').addEventListener('mousedown', this.startDraw);

    document.addEventListener('keydown', this.onMoveKeyDown);
    document.addEventListener('keyup', this.onMoveKeyUp);
    this.selectFullPath();
  }

  componentWillUnmount() {
    document.getElementById('guidePanel').removeEventListener('onZoom', this.setZoom);
    document.getElementById('contentSvg').removeEventListener('mousedown', this.startDraw);

    document.getElementById('bbox').removeEventListener('mousedown', this.startDraw);
    document.getElementById('resizer').removeEventListener('mousedown', this.startDraw);
    document.getElementById('rotator').removeEventListener('mousedown', this.startDraw);

    document.removeEventListener('keydown', this.onMoveKeyDown);
    document.removeEventListener('keyup', this.onMoveKeyUp);
  }

  startDraw(e) {
    if (this.index != -1) {
      return;
    }
    switch (e.currentTarget.id) {
      case 'contentSvg':
        if (!e.ctrlKey) {
          return;
        }
        this.drawType = 'path';
        break;
      case 'bbox':
        this.drawType = 'move';
        const bbox = document.getElementById('bbox').getBoundingClientRect();
        this.innerOffset = {
          x: parseInt(e.clientX - bbox.left),
          y: parseInt(e.clientY - bbox.top)
        };
        break;
      case 'resizer':
        this.drawType = 'resize';
        const resizer = document.getElementById('resizer').getBoundingClientRect();
        this.innerOffset = {
          x: parseInt(e.clientX - resizer.left),
          y: parseInt(e.clientY - resizer.top)
        };
        break;
      case 'rotator':
        this.drawType = 'rotate';
        break;

    }
    this.box = document.querySelector('svg').getBoundingClientRect();
    document.addEventListener('mousemove', this.doDraw);
    document.addEventListener('mouseup', this.stopDraw);

    this.offset = {
      x: parseInt(this.revx(e.clientX - this.box.left)),
      y: parseInt(this.revy(e.clientY - this.box.top))
    };

    const bbox = document.getElementById('bbox');
    this.moveBox = {
      x: parseInt(bbox.getAttribute('x')),
      y: parseInt(bbox.getAttribute('y')),
      width: parseInt(bbox.getAttribute('width')),
      height: parseInt(bbox.getAttribute('height'))
    };


    if (e.currentTarget.id == 'contentSvg') {
      this.tempD = `M ${this.offset.x} ${this.offset.y} `;
    }
  }

  doDraw(e) {
    const xx = parseInt(this.revx(e.clientX - this.box.left));
    const yy = parseInt(this.revy(e.clientY - this.box.top));
    if (this.drawType == 'path') {
      if (Math.sqrt((xx - this.offset.x) * (xx - this.offset.x) + (yy - this.offset.y) * (yy - this.offset.y)) > 50) {
        this.tempD += `L ${xx} ${yy}`;
        this.offset = { x: xx, y: yy };
      }
      const temp = `${this.tempD}L ${xx} ${yy}`;
      this.props.update(temp);
    } else if (this.drawType == 'move') {
      const path = document.getElementById(this.props.id);
      const str = `translate(${xx - this.offset.x},${yy - this.offset.y})`;
      path.setAttribute('transform', str);
      document.getElementById('bbox').setAttribute('x', e.clientX - this.box.left - this.innerOffset.x);
      document.getElementById('bbox').setAttribute('y', e.clientY - this.box.top - this.innerOffset.y);
    } else if (this.drawType == 'resize') {
      const resizer = document.getElementById('resizer');
      const newWidth = parseInt(resizer.getAttribute('x')) - this.moveBox.x;
      const newHeight = parseInt(resizer.getAttribute('y')) - this.moveBox.y;
      let str = `translate(${this.revx(this.moveBox.x)},${this.revy(this.moveBox.y)}) `;
      str += `scale(${newWidth / this.moveBox.width},${newHeight / this.moveBox.height}) `;
      str += `translate(${this.revx(this.moveBox.x) * -1},${this.revy(this.moveBox.y) * -1}) `;
      document.getElementById(this.props.id).setAttribute('transform', str);
      resizer.setAttribute('x', e.clientX - this.box.left - this.innerOffset.x);
      resizer.setAttribute('y', e.clientY - this.box.top - this.innerOffset.y);
    } else if (this.drawType == 'rotate') {
      let angle = Math.atan2((e.clientY - this.box.top) - this.moveBox.y - this.moveBox.height / 2, (e.clientX - this.box.left) - this.moveBox.x - this.moveBox.width / 2);
      console.log('angle:', parseInt(angle * 180 / Math.PI));
      angle = parseInt(angle * 180 / Math.PI);
      angle += 45;
      const path = document.getElementById(this.props.id);
      let str = `translate(${this.revx(this.moveBox.x + this.moveBox.width / 2)},${this.revy(this.moveBox.y + this.moveBox.height / 2)}) `;
      str += `rotate(${angle}) `;
      str += `translate(${this.revx(this.moveBox.x + this.moveBox.width / 2) * -1},${this.revy(this.moveBox.y + this.moveBox.height / 2) * -1}) `;
      path.setAttribute('transform', str);
    }
  }

  stopDraw(e) {
    document.removeEventListener('mousemove', this.doDraw);
    document.removeEventListener('mouseup', this.stopDraw);
    const path = document.getElementById(this.props.id);
    if (this.drawType == 'move') {
      const transform = path.getAttribute('transform');
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)$/);
      console.dir(arr);
      const data = utils.translate(this.state.data, parseInt(arr[1]), parseInt(arr[2]));

      const d = utils.objToData(data);
      path.setAttribute('d', d);
      this.props.update(d);
      path.removeAttribute('transform');
      this.selectFullPath();
    } else if (this.drawType == 'resize') {
      const transform = path.getAttribute('transform');
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)\s+scale\(([0-9\.\-]+)\,([0-9\.\-]+)\)/);
      console.dir(arr);
      const data = utils.resize(this.state.data, Number(arr[1]), Number(arr[2]), Number(arr[3]), Number(arr[4]));

      const d = utils.objToData(data);
      path.setAttribute('d', d);
      this.props.update(d);
      path.removeAttribute('transform');
      this.selectFullPath();
    } else if (this.drawType == 'rotate') {
      const transform = path.getAttribute('transform');
      const arr = transform.match(/^translate\(([0-9\.\-]+)\,([0-9\.\-]+)\)\s+rotate\(([0-9\.\-]+)\)/);
      console.dir(arr);

      const data = utils.rotate(this.state.data, Number(arr[1]), Number(arr[2]), Number(arr[3]));
      const d = utils.objToData(data);
      path.setAttribute('d', d);
      this.props.update(d);
      path.removeAttribute('transform');
      this.selectFullPath();
    }
  }


  changeMicroType(type) {
    let obj = this.state.data.get(this.index);
    if (obj.type == type || type == 'M') {
      return;
    }
    const prev = this.state.data.get(this.index - 1);
    console.log('type:', type, this.index);
    switch (type) {
      case 'C':
        if (!obj.ctx) {
          obj.ctx = parseInt(prev.x + (obj.x - prev.x) / 3);
          obj.cty = parseInt(prev.y + (obj.y - prev.y) / 3);
        }
        obj.ct2x = parseInt(prev.x + (obj.x - prev.x) / 3 * 2);
        obj.ct2y = parseInt(prev.y + (obj.y - prev.y) / 3 * 2);
        break;
      case 'Q':
        if (!obj.ctx) {
          obj.ctx = parseInt(prev.x + (obj.x - prev.x) / 2);
          obj.cty = parseInt(prev.y + (obj.y - prev.y) / 2);
        }
        if (obj.ct2x) {
          delete obj.ct2x;
          delete obj.ct2y;
        }
        break;
      case 'L':
        if (obj.ctx) {
          delete obj.ctx;
          delete obj.cty;
        }
        if (obj.ct2x) {
          delete obj.ct2x;
          delete obj.ct2y;
        }
        break;
      case 'Insert':
        let selected = document.querySelector('.pathListWrapper li.selected');
        if (!selected) {
          selected = document.querySelector('.pathListWrapper').lastChild;
        }
        let id = selected.id;
        id = parseInt(id.substr(id.indexOf('~') + 1));
        console.log('id', id);
        obj = {
          type: 'L',
          x: parseInt(obj.x + 30),
          y: parseInt(prev.y + 30)
        };
        break;
      case 'Delete':
        break;
    }
    let d;
    if (type == 'Insert') {
      console.dir(this.state.data.toJS());
      d = this.state.data.splice(this.index + 1, 0, obj);
      this.index += 1;
      console.dir(d.toJS());
    } else if (type == 'Delete') {
      d = this.state.data.splice(this.index, 1);
    } else {
      obj.type = type;
      console.dir(obj);
      d = this.state.data.set(this.index, obj);
    }
   // this.props.update(utils.objToData(this.state.data));
     // return;
    this.setState({ data: d },
      () => {
        console.dir(this.state.data.toJS());
        document.getElementById(this.props.id).setAttribute('d', utils.objToData(this.state.data));
        console.log('after = ', document.getElementById(this.props.id).getAttribute('d'));
        this.props.update(document.getElementById(this.props.id).getAttribute('d'));
      });
    setTimeout(() => this.placeCtrls(), 100);
  }

  revx(val) {
    return parseInt((val - parseInt(document.getElementById('contentSvg').getAttribute('x'))) / window.gtw.zoom);
  }

  revy(val) {
    return parseInt((val - parseInt(document.getElementById('contentSvg').getAttribute('y'))) / window.gtw.zoom);
  }

  modx(val) {
    return parseInt(val * window.gtw.zoom + parseInt(document.getElementById('contentSvg').getAttribute('x')));
  }

  mody(val) {
    return parseInt(val * window.gtw.zoom + parseInt(document.getElementById('contentSvg').getAttribute('y')));
  }

  onKeyPress(e) {
    console.log(document.querySelector('.pathListWrapper .selected').innerText);
    const node = document.querySelector('.pathListWrapper .selected');
    let str = node.innerText;
    str = str.trim();
    const reg = /[MLCQ][\-?0-9\s]+/g;
    if (reg.test(str)) {
      const obj = utils.dataToObjUnit(str);
      if (obj) {
        node.classList.remove('invalid');
        this.setState({ data: this.state.data.set(this.index, obj) });
        const dd = utils.objToData(this.state.data);
        document.getElementById(this.props.id).setAttribute('d', dd);
        this.props.update(document.getElementById(this.props.id).getAttribute('d'));
      } else {
        node.classList.add('invalid');
      }
    } else {
      node.classList.add('invalid');
    }
  }

  placeCtrls(e) {
    if (e && e.target && e.target.id) {
      let id = e.target.id;
      id = parseInt(id.substr(id.indexOf('~') + 1));
      if (isNaN(id)) {
        return;
      }
      this.index = id;
      const selected = e.target.parentNode.querySelector('.selected');
      if (selected) {
        selected.classList.remove('selected');
        selected.removeAttribute('contentEditable');
        selected.removeEventListener('keyup', this.onKeyPress);
      }
      e.target.classList.add('selected');
      e.target.setAttribute('contentEditable', 'true');
      e.target.addEventListener('keyup', this.onKeyPress);
    }

    document.getElementById('bboxGroup').setAttribute('display', 'none');

    const obj = this.state.data.get(this.index);
    let prev;
    if (this.index != 0) {
      prev = this.state.data.get(this.index - 1);
    }
    console.dir(obj);
    this.pt2.setAttribute('cx', this.modx(obj.x));
    this.pt2.setAttribute('cy', this.mody(obj.y));

    this.pt2.setAttribute('display', 'none');
    this.ctrl1.setAttribute('display', 'none');
    this.ctrl2.setAttribute('display', 'none');
    this.line1.setAttribute('display', 'none');
    this.line2.setAttribute('display', 'none');

    switch (obj.type) {
      case 'M':
      case 'L':
        this.pt2.setAttribute('display', 'block');
        break;
      case 'C':
        this.ctrl1.setAttribute('cx', this.modx(obj.ctx));
        this.ctrl1.setAttribute('cy', this.mody(obj.cty));
        this.ctrl2.setAttribute('cx', this.modx(obj.ct2x));
        this.ctrl2.setAttribute('cy', this.mody(obj.ct2y));

        this.line1.setAttribute('x1', this.modx(prev.x));
        this.line1.setAttribute('y1', this.mody(prev.y));
        this.line1.setAttribute('x2', this.modx(obj.ctx));
        this.line1.setAttribute('y2', this.mody(obj.cty));

        this.line2.setAttribute('x1', this.modx(obj.ct2x));
        this.line2.setAttribute('y1', this.mody(obj.ct2y));
        this.line2.setAttribute('x2', this.modx(obj.x));
        this.line2.setAttribute('y2', this.mody(obj.y));

        this.pt2.setAttribute('display', 'block');
        this.ctrl1.setAttribute('display', 'block');
        this.ctrl2.setAttribute('display', 'block');
        this.line1.setAttribute('display', 'block');
        this.line2.setAttribute('display', 'block');

        break;
      case 'Q':
        this.ctrl1.setAttribute('cx', this.modx(obj.ctx));
        this.ctrl1.setAttribute('cy', this.mody(obj.cty));

        this.line1.setAttribute('x1', this.modx(prev.x));
        this.line1.setAttribute('y1', this.mody(prev.y));
        this.line1.setAttribute('x2', this.modx(obj.ctx));
        this.line1.setAttribute('y2', this.mody(obj.cty));


        this.line2.setAttribute('x1', this.modx(obj.ctx));
        this.line2.setAttribute('y1', this.mody(obj.cty));
        this.line2.setAttribute('x2', this.modx(obj.x));
        this.line2.setAttribute('y2', this.mody(obj.y));

        this.pt2.setAttribute('display', 'block');
        this.ctrl1.setAttribute('display', 'block');
        this.line1.setAttribute('display', 'block');
        this.line2.setAttribute('display', 'block');
        break;
    }
  }

  render() {
    return (
      <div className="pathListWrapper">
        <div className="dWrapper">
          <label>data : </label><textarea id="d" type="text" value={this.props.d} onChange={e => this.props.update(e.target.value)} />
        </div>
        <div className="btnWrapper">
          <button onClick={this.selectFullPath} className="form-control" > Select All </button>
          <button onClick={() => this.changeMicroType('C')} className="form-control"> C </button>
          <button onClick={() => this.changeMicroType('Q')} className="form-control"> Q </button>
          <button onClick={() => this.changeMicroType('L')} className="form-control"> L </button>
          <button onClick={() => this.changeMicroType('Insert')} className="form-control"> Insert After </button>
          <button onClick={() => this.changeMicroType('Delete')} className="form-control"> Delete </button>
        </div>
        <ol onClick={this.placeCtrls} >
          {
    this.state.data.map((item, i) => {
      switch (item.type) {
        case 'L':
        case 'M':
          return <li key={`item~${i}`} id={`item~${i}`}>{`${item.type} ${Math.round(item.x)} ${Math.round(item.y)}`} </li>;
        case 'C':
          return (<li key={`item~${i}`} id={`item~${i}`}>{`${item.type} ${Math.round(item.ctx)
               } ${Math.round(item.cty)} ${Math.round(item.ct2x)} ${
               Math.round(item.ct2y)} ${
               Math.round(item.x)} ${Math.round(item.y)}`} </li>);
        case 'Q':
          return (<li key={`item~${i}`} id={`item~${i}`}>{`${item.type} ${Math.round(item.ctx)
               } ${Math.round(item.cty)} ${
               Math.round(item.x)} ${Math.round(item.y)}`} </li>);

      }
    })
  }
        </ol>

      </div>
    );
  }
}

export default PathEditor;
