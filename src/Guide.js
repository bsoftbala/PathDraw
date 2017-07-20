import React, { Component } from 'react';
import { render } from 'react-dom';
import { List } from 'immutable';

import SVG from 'svgjs';

class Guide extends Component {
  constructor() {
    super();
    this.showRuler = true;
    this.showGuide = true;
    this.zoom = 1;
    this.zoomLimit = 3;
    this.state = {
      src: 'https://www.amrita.edu/sites/default/files/news-images/new/news-events/images/l-nov/grass.jpg',
      x: 0,
      y: 0,
      width: 600,
      height: 480,
      visible: true,
      hLines: [],
      vLines: []
    };
    this.setZoom = this.setZoom.bind(this);
    this.editGuideLines = this.editGuideLines.bind(this);
    this.onGuideChange = this.onGuideChange.bind(this);
    this.changeProperties = this.changeProperties.bind(this);

    this.startPane = this.startPane.bind(this);
    this.doPane = this.doPane.bind(this);
    this.endPane = this.endPane.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.drawScale();
      document.getElementById('guidePanel').addEventListener('onZoom', this.setZoom);
      document.getElementById('contentSvg').addEventListener('mousedown', this.startPane);
    }, 10);
  }

  drawScale() {
    const svgcontent = document.getElementById('contentSvg');
    const xLimit = parseInt(svgcontent.getAttribute('x'));
    const yLimit = parseInt(svgcontent.getAttribute('y'));

    let leastDiv;
    if (this.zoom < 200) {
      leastDiv = 50;
    } else {
      leastDiv = 25;
    }
    const step = this.zoom * leastDiv;
    let no = Math.floor(xLimit / step) * -1 * leastDiv;

    let x = xLimit % step;
    let d = '';
    const draw = SVG('rootSvg');

    const lab = document.getElementById('rulerLabels');
    if (lab) {
      lab.parentNode.removeChild(lab);
    }
    const labels = draw.nested().attr('id', 'rulerLabels');
    while (x < window.innerWidth) {
      d += `M ${x} 25 L ${x} 15 `;
      const text = labels.text(String(no));
      const offset = text.bbox().width / 2;
      text.move(x - offset, 2).attr({ fill: '#006674', stroke: 'none' });
      x += step;
      no += leastDiv;
    }

    let y = yLimit % step;
    no = Math.floor(yLimit / step) * -1 * leastDiv;
    if (y < 25) {
      no += leastDiv;
      y += step;
    }
    while (y < window.innerHeight) {
      d += `M 25 ${y} L 15 ${y} `;
      const text = labels.text(String(no));
      const offset = text.bbox().width / 2;
      text.move(7 - offset, y - text.bbox().height / 2).attr({ fill: '#006674', stroke: 'none' }).rotate(-90);
      y += step;
      no += leastDiv;
    }

    d += `M 0 25 L ${window.innerWidth} 25 `;
    d += `M 25 25 L 25 ${window.innerHeight}`;

    document.getElementById('rulerLines').setAttribute('d', d);
    console.log(d);
  }


  setZoom(e) {
    console.dir(e);
    const id = e.detail.id;
    const prevZoom = this.prevZoom = this.zoom;
    if (id == 'zoomIn') {
      this.zoom += 0.2;
      if (this.zoom > this.zoomLimit) {
        this.zoom = this.zoomLimit;
      }
    } else if (id == 'zoomOut') {
      this.zoom -= 0.2;
      if (this.zoom < 1) {
        this.zoom = 1;
      }
    } else if (id == 'zoomFit') {
      this.zoom = 1;
    }
    window.gtw.zoom = this.zoom;
    console.log(`this.zoom = ${this.zoom}:${id}`);
    const svgroot = document.getElementById('rootSvg');
    const svgcontent = document.getElementById('contentSvg');

    svgcontent.setAttribute('width', window.gtw.width * this.zoom);
    svgcontent.setAttribute('height', window.gtw.height * this.zoom);

    const w = svgcontent.getAttribute('width');
    const h = svgcontent.getAttribute('height');

    svgcontent.setAttribute('viewBox', `0 0 ${w / this.zoom} ${h / this.zoom}`);


    const oldX = svgcontent.getAttribute('x');
    const oldY = svgcontent.getAttribute('y');
    const newX = oldX - (this.zoom - prevZoom) * window.gtw.width / 2;
    const newY = oldY - (this.zoom - prevZoom) * window.gtw.height / 2;
    svgcontent.setAttribute('x', newX);
    svgcontent.setAttribute('y', newY);
    setTimeout(() => this.drawScale(), 10);
  }

  editGuideLines(e) {
    const arr = e.target.value.split(',').map(item => Number(item));
    if (arr.indexOf(NaN) != -1) {
      return;
    }
    let lines;
    if (e.target.id == 'vLinesTxt') {
      const xLimit = parseInt(document.getElementById('contentSvg').getAttribute('x'));
      lines = arr.map((value) => {
        value = xLimit + this.zoom * value;
        return <line x1={value} y1="0" x2={value} y2={window.innerHeight} />;
      });
      render(<g> {lines} </g>, document.getElementById('vGuideLines'));
      this.setState({ vLines: arr });
    } else {
      const yLimit = parseInt(document.getElementById('contentSvg').getAttribute('y'));
      lines = arr.map((value) => {
        value = yLimit + this.zoom * value;
        return <line x1="0" y1={value} x2={window.innerWidth} y2={value} />;
      });
      render(<g> {lines} </g>, document.getElementById('hGuideLines'));
      this.setState({ hLines: arr });
    }
  }

  changeProperties(e) {
    if (e.target.id == 'toggleRuler') {
      this.showRuler = !this.showRuler;
    }
    const displayVal = (this.showRuler) ? 'block' : 'none';
    /*
    document.getElementById('rulerLines').setAttribute("display", displayVal);
    document.getElementById('rulerTop').setAttribute("display", displayVal);
    document.getElementById('rulerLeft').setAttribute("display", displayVal);*/
    document.getElementById('rulerLabels').setAttribute('display', displayVal);
    document.getElementById('guides').setAttribute('display', displayVal);
  }

  onGuideChange(e) {
    // e.preventDefault();
    if (e.target.id == 'guideImage') {
      let files;
      if (e.dataTransfer) {
        files = e.dataTransfer.files;
      } else if (e.target) {
        files = e.target.files;
      }
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('guideImage').setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
        this.setState({ src: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else if (e.target.id == 'guideVisible') {
      /*
      this.setState((prevState) => {
        let visible = !prevState.visible;
        return ({ visible })
      },
      () => {
         document.getElementById("guideImage").setAttribute("display",(this.state.visible)?"block":"none");
         this.showGuide = !this.showGuide;
      }
      )*/

      document.getElementById('guideImage').setAttribute('display', (this.showGuide) ? 'block' : 'none');
      this.showGuide = !this.showGuide;
    } else {
      this.setState({ [e.target.id]: e.target.value });
      document.getElementById('guideImage').setAttribute(e.target.id, e.target.value);
    }
  }

  startPane(e) {
    console.log(`startPane : ${e.shiftKey}`);
    if (!e.shiftKey) {
      return;
    }
    document.addEventListener('mousemove', this.doPane);
    document.addEventListener('mouseup', this.endPane);
    const content = document.getElementById('contentSvg');
    content.style.cursor = 'grabbing';
    this.offset = {
      x: e.clientX - parseInt(content.getAttribute('x')),
      y: e.clientY - parseInt(content.getAttribute('y')),
    };
  }

  doPane(e) {
    console.log('doPane');
    const content = document.getElementById('contentSvg');
    content.setAttribute('x', e.clientX - this.offset.x);
    content.setAttribute('y', e.clientY - this.offset.y);
  }

  endPane(e) {
    const content = document.getElementById('contentSvg');
    content.style.cursor = 'default';
    document.removeEventListener('mousemove', this.doPane);
    document.removeEventListener('mouseup', this.endPane);
    this.drawScale();
  }

  render() {
    return (
      <div id="guidePanel" className="guideWrapper" >
        <header onMouseDown={this.props.panelDragStart}>
          <h4> Guide <i onClick={this.props.hidePanel} className="fa fa-times" aria-hidden="true" /></h4>
        </header>
        <div>
          <input type="file" id="guideImage" onChange={this.onGuideChange} />
        </div>
        <div className="guideForm" >
          <div className="guideXY">
            <label>X:</label>
            <input className="form-control" type="number" id="x" value={this.state.x} onChange={this.onGuideChange} />
            <label>Y:</label>
            <input className="form-control" type="number" id="y" value={this.state.y} onChange={this.onGuideChange} />
          </div>
          <div className=" guideWidth" >
            <label >Width:</label>
            <input className="form-control " type="number" id="width" value={this.state.width} onChange={this.onGuideChange} />
            <label>Height:</label>
            <input className="form-control" type="number" id="height" value={this.state.height} onChange={this.onGuideChange} />
          </div>
        </div>

        <div >
          <label>Horizontal GuideLines : </label>
          <input className="form-control" type="text" id="hLinesTxt" onChange={this.editGuideLines} value={this.state.hLines.join(',')} />

          <label className="verti">Vertical GuideLines : </label>
          <input className="form-control " type="text" id="vLinesTxt" onChange={this.editGuideLines} value={this.state.vLines.join(',')} />
        </div>

        <div className="check" >
          <input type="checkbox" value={this.showGuide} id="guideVisible" onClick={this.onGuideChange} />
          <label> Show Guide </label>

          <input type="checkbox" value={this.showRuler} id="toggleRuler" onClick={this.changeProperties} />
          <label > Show Ruler </label>
        </div>


      </div>
    );
  }
}

export default Guide;
