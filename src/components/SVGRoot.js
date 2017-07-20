import React from 'react';
import { connect } from 'react-redux';

import SvgControlsUI from './SvgControlsUI';
import Ruler from './Ruler';
import { dataToNode } from '../utils';

let SVGRoot = (props) => {
  const config = props.config;
  console.dir(props);
  let contentSvg;
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
        <rect width={config.width} height={config.height} x="0" y="0" fill="#ffffff" />
        <g id="guide" stroke="red" strokeWidth="1">

          <image id="guideImage" x="0" y="0" width="600" height="480" />
        </g>
        <svg id="content" stroke="blue">
          {dataToNode(props.allDraws.list)}
        </svg>
      </svg>
      <g id="tempContent" stroke="red" />

      <SvgControlsUI parentRef={contentSvg} />
      <Ruler />
    </svg>
  );
};

const mapStateToProps = ({ config, allDraws }) => ({ config, allDraws });

SVGRoot = connect(mapStateToProps)(SVGRoot);

export default SVGRoot;

