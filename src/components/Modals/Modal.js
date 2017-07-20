import React from 'react';
import { CompactPicker } from 'react-color';
import { connect } from 'react-redux';

import { showPopup } from '../../actions';


import './style.css';

let Modal = (props) => {
  let dragPanel,
    rootBox,
    dragOffset;

  const panelDragStart = (e) => {
    e.preventDefault();
    dragPanel = e.currentTarget.parentNode;
    dragOffset = {
      x: e.clientX - dragPanel.getBoundingClientRect().left,
      y: e.clientY - dragPanel.getBoundingClientRect().top,
    };
    rootBox = document.querySelector('.pathMathWrapper').getBoundingClientRect();
    document.addEventListener('mousemove', panelDragMove);
    document.addEventListener('mouseup', panelDragStop);
  };

  const panelDragMove = (e) => {
    let x = e.clientX - dragOffset.x;
    if (x < rootBox.left) x = rootBox.left;
    if (x > rootBox.left + rootBox.width - dragPanel.getBoundingClientRect().width) {
      x = rootBox.left + rootBox.width - dragPanel.getBoundingClientRect().width;
    }

    let y = e.clientY - dragOffset.y + window.scrollY;
    if (y < rootBox.top) y = rootBox.top;
    if (y > rootBox.top + rootBox.height - dragPanel.getBoundingClientRect().height) {
      y = rootBox.top + rootBox.height - dragPanel.getBoundingClientRect().height;
    }
    dragPanel.style.left = `${x}px`;
    dragPanel.style.top = `${y}px`;
  };

  const panelDragStop = (e) => {
    document.removeEventListener('mousemove', panelDragMove);
    document.removeEventListener('mouseup', panelDragStop);
  };

  return (
    <div id={props.id} >
      <header onMouseDown={panelDragStart}>
        <h4> {props.title}            <i onClick={e => props.dispatch(showPopup(props.popupName, false))} className="fa fa-times" aria-hidden="true" /></h4>
      </header>
      {props.children}
    </div>
  );
};

Modal = connect()(Modal);

export default Modal;
