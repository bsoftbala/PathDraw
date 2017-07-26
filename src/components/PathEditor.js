import React from 'react';
import { connect } from 'react-redux';

import * as utils from '../utils';
import segUtils from '../utils/segUtils';

import { editItem, selectPathSeg } from '../actions';


let PathEditor = ({ data, index, segIndex, dispatch }) => {
  const list = utils.dataToObj(data.d);
  console.dir(list);
  const changeMicroType = (type) => {
    const newData = segUtils.modifyItem(list, segIndex, type);
    console.dir(newData);
    dispatch(editItem({...data, d: utils.objToData(newData)}, index));
  };

  const attrChange = (type, e) => {
    const newData = { ...data, type: e.target.value };
    dispatch(editItem(newData, index));
  };

  const placeCtrls = (e) => {
    if (e && e.target && e.target.id) {
      let id = e.target.id;
      console.log(`id = ${id}`);
      id = parseInt(id.substr(id.indexOf('~') + 1));
      if (isNaN(id)) {
        return;
      }
      dispatch(selectPathSeg(id));
    }
  };

  const btnGroupStyle = {
    pointerEvents: (segIndex === -1) ? 'none' : 'auto',
    opacity: (segIndex === -1) ? 0.5 : 1
  }

  return (
    <div className="pathListWrapper">
      <div className="dWrapper">
        <label>data : </label><textarea
          type="text"
          value={data.d}
          onChange={e => attrChange('d', e)}
        />
      </div>
      <div className="btnWrapper">
        <span style = {btnGroupStyle} >
          <button onClick={() => changeMicroType('C')} className="form-control"> C </button>
          <button onClick={() => changeMicroType('Q')} className="form-control"> Q </button>
          <button onClick={() => changeMicroType('L')} className="form-control"> L </button>
          <button onClick={() => changeMicroType('Insert')} className="form-control"> Insert After </button>
          <button onClick={() => changeMicroType('Delete')} className="form-control"> Delete </button>
        </span>
      </div>
      <ol onClick={placeCtrls} >
        {
  list.map((item, i) => {
    let selected = '';
    if(i == segIndex){
      selected = 'selected';
    }
    switch (item.type) {
      case 'L':
      case 'M':
        return <li key={`seg~${i}`} id={`seg~${i}`} className = {selected} >{`${item.type} ${Math.round(item.x)} ${Math.round(item.y)}` } </li>;
      case 'C':
        return (<li key={`seg~${i}`} id={`seg~${i}`} className = {selected} >{`${item.type} ${Math.round(item.ctx)
             } ${Math.round(item.cty)} ${Math.round(item.ct2x)} ${
             Math.round(item.ct2y)} ${
             Math.round(item.x)} ${Math.round(item.y)}`} </li>);
      case 'Q':
        return (<li key={`seg~${i}`} id={`seg~${i}`} className = {selected} > {`${item.type} ${Math.round(item.ctx)
             } ${Math.round(item.cty)} ${
             Math.round(item.x)} ${Math.round(item.y)}`} </li>);

    }
  })
}
      </ol>

    </div>
  );
};

const mapStateToProps = ({ allDraws, config }) => ({ data: allDraws.present.list.get(allDraws.present.currentId),
  index: allDraws.present.currentId,
  segIndex: allDraws.present.segIndex
});

PathEditor = connect(mapStateToProps)(PathEditor);

export default PathEditor;
