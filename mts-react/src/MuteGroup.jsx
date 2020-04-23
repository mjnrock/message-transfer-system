/* eslint-disable */
import React from "react";

export default class MuteGroup extends React.Component {
    render() {
        return (
            <div className="group">
                {
                    this.props.audio ? (
                        <button className="ribbon-button">
                            <span className="icon">
                                <span className={ `mif-mic` }></span>
                            </span>
                            
                            <span className="caption">Audio</span>
                        </button>
                    ) : null
                }

                {
                    this.props.video ? (
                        <button className="ribbon-button">
                            <span className="icon">
                                <span className={ `mif-camera` }></span>
                            </span>
                            
                            <span className="caption">Video</span>
                        </button>
                    ) : null
                }
                
                <span className="title">Mute</span>
            </div>
        );
    }
};