import React from 'react';
import { connect } from 'react-redux';
import * as utils from '../utils';
import { editItem } from '../actions';
import SVG from '../utils/svgjs';


class Ruler extends React.Component {

  constructor(props) {
    super(props);
    setTimeout(() => this.drawScale(), 1000);
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    console.log('Ruler componentDidUpdate');
    this.drawScale();
    this.setZoom();
  }

  shouldComponentUpdate() {
    console.log('Ruler shouldComponentUpdate');
    return true;
  }

  componentWillUpdate() {
    console.log('Ruler componentWillUpdate');
  }

  componentWillReceiveProps(nextProps) {
    console.log('Ruler componentWillReceiveProps');
    return true;
  }

  drawScale() {
    const svgcontent = document.getElementById('contentSvg');
    const xLimit = parseInt(svgcontent.getAttribute('x'));
    const yLimit = parseInt(svgcontent.getAttribute('y'));
    const { zoom } = this.props.config;
    let leastDiv;
    if (zoom < 200) {
      leastDiv = 50;
    } else {
      leastDiv = 25;
    }
    const step = zoom * leastDiv;
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
  }

  setZoom() {
    const { zoom, width, height } = this.props.config;
    const svgroot = document.getElementById('rootSvg');
    const svgcontent = document.getElementById('contentSvg');

    svgcontent.setAttribute('width', width * zoom);
    svgcontent.setAttribute('height', height * zoom);

    const w = svgcontent.getAttribute('width');
    const h = svgcontent.getAttribute('height');

    svgcontent.setAttribute('viewBox', `0 0 ${w / zoom} ${h / zoom}`);

    /*
    var oldX = svgcontent.getAttribute('x');
    var oldY = svgcontent.getAttribute('y');
    let newX = oldX - (this.zoom - prevZoom) * window.gtw.width / 2;
    let newY = oldY - (this.zoom - prevZoom) * window.gtw.height / 2;
    svgcontent.setAttribute("x", newX);
    svgcontent.setAttribute("y", newY);*/
  }


  render() {
    return (
      <g id="guides">
        <g id="vGuideLines" stroke="#00ff00" />
        <g id="hGuideLines" stroke="#00ff00" />
        <rect id="rulerTop" x="0" y="0" width={window.innerWidth - 5} height="25" fill="#b2b2b3" stroke="none" />
        <rect id="rulerLeft" x="0" y="25" width="25" height={window.innerHeight - 20} fill="#b2b2b3" stroke="none" />
        <path d="" stroke="#777777" id="rulerLines" />
      </g>
    );
  }
}

const mapStateToProps = ({ config }) => ({ config });

Ruler = connect(mapStateToProps)(Ruler);

export default Ruler;
