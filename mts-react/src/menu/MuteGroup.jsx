/* eslint-disable */
import React from "react";

export default class MuteGroup extends React.Component {
    render() {
        return (
            <div className="group">
                {
                    this.props.audio ? (
                        <button className="ribbon-button" onClick={ e => this.props.onClick("cmd.audio") }>
                            <span className="icon">
                                <span className={ `mif-mic ${ this.props.isAudioPaused ? "fg-red" : "fg-emerald" }` }></span>
                            </span>
                            
                            <span className="caption">Audio</span>
                        </button>
                    ) : null
                }

                {
                    this.props.video ? (
                        <button className="ribbon-button" onClick={ e => this.props.onClick("cmd.video") }>
                            <span className="icon">
                                <span className={ `mif-camera ${ this.props.isVideoPaused ? "fg-red" : "fg-emerald" }` }></span>
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