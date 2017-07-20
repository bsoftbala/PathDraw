import React from 'react';
import { connect } from 'react-redux';

import Modal from './Modal';

let Guide = props => {
  if(!props.popups.guide){
    return null;
  }
  return (
      <Modal title="Guide" id="guidePanel" popupName={'guide'} >
        <h1> Guide </h1>
        {/*
                  <div>
                    <input type='file' id="guideImage" onChange = {this.onGuideChange}/>
                  </div>
                    <div className = "guideForm" >
                    <div className="guideXY">
                      <label>X:</label>
                      <input className="form-control" type = "number" id = "x" value = {this.state.x} onChange = {this.onGuideChange}/>
                      <label>Y:</label>
                      <input className="form-control" type = "number" id = "y" value = {this.state.y} onChange = {this.onGuideChange}/>
                  </div>
                  <div className=" guideWidth" >
                      <label >Width:</label>
                      <input className="form-control " type = "number" id = "width" value = {this.state.width} onChange = {this.onGuideChange}/>
                      <label>Height:</label>
                      <input className="form-control" type = "number" id  = "height" value = {this.state.height} onChange = {this.onGuideChange}/>
                    </div>
                    </div>

                    <div >
                      <label>Horizontal GuideLines : </label>
                        <input className="form-control"  type = "text" id = "hLinesTxt" onChange = {this.editGuideLines} value = {this.state.hLines.join(',')} />

                      <label  className="verti">Vertical GuideLines : </label>
                        <input className="form-control "  type = "text" id = "vLinesTxt" onChange = {this.editGuideLines} value = {this.state.vLines.join(',')} />
                  </div>

                  <div className="check" >
                  <input type = "checkbox" value = {this.showGuide} id = "guideVisible" onClick = {this.onGuideChange} />
                    <label> Show Guide </label>

                    <input type = "checkbox" value = {this.showRuler} id = "toggleRuler" onClick = {this.changeProperties} />
                    <label > Show Ruler </label>
    </div>

                */ }
      </Modal>
            )
};

const mapStateToProps = ({ config }) => ({ popups: config.popups });
Guide = connect(mapStateToProps)(Guide);

export default Guide;
