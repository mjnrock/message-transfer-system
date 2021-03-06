/* eslint-disable */
import React from "react";

export default class MuteGroup extends React.Component {
    render() {
        return (
            <div className="group">
                {
                    this.props.audio ? (
                        <button className="ribbon-button" onClick={ e => this.props.onMessage("cmd.audio") }>
                            <span className="icon">
                                <span className={ `${ this.props.audioIcon ? this.props.audioIcon : "mif-mic" } ${ this.props.isAudioPaused ? "fg-red" : "fg-emerald" }` }></span>
                            </span>
                            
                            <span className="caption">Audio</span>
                        </button>
                    ) : null
                }

                {
                    this.props.video ? (
                        <button className="ribbon-button" onClick={ e => this.props.onMessage("cmd.video") }>
                            <span className="icon">
                                <span className={ `${ this.props.videoIcon ? this.props.videoIcon : "mif-camera" } ${ this.props.isVideoPaused ? "fg-red" : "fg-emerald" }` }></span>
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