/* eslint-disable */
import React from "react";

import Context from "./Context";

export default class MuteGroup extends React.Component {
    static contextType = Context;

    render() {
        if(this.context.stream && this.context.stream.active) {
            return (
                <div className="group">
                    {
                        this.context.tracks.audio ? (
                        <button className="ribbon-button" onClick={ e => this.props.feedback(`stream.audio.mute`) }>
                            <span className="icon">
                                <span className={ `mif-mic ${ this.context.tracks.audio.enabled ? "fg-emerald" : "fg-red" }` }></span>
                            </span>
                            
                            <span className="caption">Audio</span>
                        </button>
                        ) : null
                    }

                    {
                        this.context.tracks.video ? (
                            <button className="ribbon-button" onClick={ e => this.props.feedback(`stream.video.mute`) }>
                                <span className="icon">
                                    <span className={ `mif-camera ${ this.context.tracks.video.enabled ? "fg-emerald" : "fg-red" }` }></span>
                                </span>
                                
                                <span className="caption">Video</span>
                            </button>
                        ) : null
                    }
                    
                    <span className="title">Mute</span>
                </div>
            );
        }

        return null;
    }
};