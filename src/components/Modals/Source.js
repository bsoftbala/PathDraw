import React from 'react';
import {connect} from 'react-redux';

import Modal from './Modal';
import {editSource} from '../../actions';

class Source extends React.Component {

	nodeRef;

	componentDidUpdate(){
		let {popups, width, height} = this.props.config;
		if(!popups.source){
			return;
		}
		let root = window.document.querySelector("#contentSvg #content");
	    let str = "<svg width = '" + width  + "' height = '" + height + "' >" + "\n";
	    for(let i = 0; i < root.childNodes.length; i++){
	      if(root.childNodes[i].nodeType == 1){
	        str += root.childNodes[i].outerHTML  + "\n";
	      }
	    }
	    str += "</svg>";
	    console.log(str);
	    this.nodeRef.value = str;
	}

	render(){
		let {popups} = this.props.config;
		if(!popups.source){
			return null;
		}
		 return (
		    <Modal title = "Source" id = "sourcePanel" popupName = {'source'}>
					<textarea className = "source" ref = {n => {this.nodeRef = n}} >
		            </textarea>
		              <div className = "footer">
		                <button className = "btn btn-primary" onClick = {e => this.props.dispatch(editSource(this.nodeRef.value))} > Update </button>
		              </div>
				</Modal>
		  )
	}

}

const mapStateToProps = ({config}) => ({config});
Source = connect(mapStateToProps)(Source);

export default Source;