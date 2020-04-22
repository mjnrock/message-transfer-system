import React from "react";

import Context from "./Context";

export default class MuteGroup extends React.Component {
    static contextType = Context;

    render() {
        if(this.props.display.isActive) {
            return (
                <div className="group">
                    {
                        this.props.display.hasAudio ? (
                        <button className="ribbon-button" onClick={ e => this.props.feedback("stream.audio.mute") }>
                            <span className="icon">
                                <span className={ `mif-mic ${ this.props.display.isMainAudioMuted ? "fg-red" : "fg-green" }` }></span>
                            </span>
                            
                            <span className="caption">Audio</span>
                        </button>
                        ) : null
                    }

                    {
                        this.props.display.hasVideo ? (
                            <button className="ribbon-button" onClick={ e => this.props.feedback("stream.video.mute") }>
                                <span className="icon">
                                    <span className={ `mif-camera ${ this.props.display.isMainVideoMuted ? "fg-red" : "fg-green" }` }></span>
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