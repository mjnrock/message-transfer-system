/* eslint-disable */
import React from "react";

export default class Button extends React.Component {
    render() {
        return (            
            <button className="ribbon-button fg-grayBlue w3 h3" onClick={ this.props.onClick }>
            {/* <button className="ribbon-button fg-grayBlue w3 h3 ma1 ba br2 b--black-20" onClick={ this.props.onClick }> */}
                <span className="icon">
                    <span className={ this.props.icon }></span>
                </span>
                
                <span className="caption">{ this.props.caption }</span>
            </button>
        );
    }
};