import React from 'react';
import { connect } from 'react-redux';

import Modal from './Modal';
import { openUnitPopup, changeStackOrder } from '../../actions';

let AllDraws = ({ allDraws, popups, dispatch }) => {
  if(!popups.allDraws){
    return null;
  }
  const onItemClick = (e) => {
    let id = e.target.id;
    id = parseInt(id.substr(id.indexOf('~') + 1));
    if (!isNaN(id)) {
      console.log(`id = ${id}`);
      dispatch(openUnitPopup(id));
    }
  };

  return (
    <Modal title="All Drawings " id="allDrawsPanel" isVisible={popups.allDraws} popupName={'allDraws'}>
      <ol id="unitDraw" onClick={onItemClick} >
        {
              allDraws.list.map((item, i) => (i === allDraws.currentId)
                  ? <li key={i} id={`draw~${i}`} className="selected" > {item.type} | {item.id} </li>
                  : <li key={i} id={`draw~${i}`} > {item.type} | {item.id} </li>
                  )
            }
      </ol>
      <div>
        <button className="btn btn-primary" onClick={e => dispatch(changeStackOrder(true))} id="upStackOrder" >
          <i className="fa fa-arrow-up" aria-hidden="true" />
              Move Up
            </button>
        <button className="btn btn-primary" onClick={e => dispatch(changeStackOrder(false))} id="downStackOrder">
          <i className="fa fa-arrow-down" aria-hidden="true" />
              Move Down
            </button>
      </div>
    </Modal>
  );
};

const mapStateToProps = ({ config, allDraws }) => ({ allDraws, popups: config.popups });

AllDraws = connect(mapStateToProps)(AllDraws);

export default AllDraws;
