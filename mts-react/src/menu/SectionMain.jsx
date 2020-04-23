/* eslint-disable */
import React from "react";

import Context from "./../Context";

export default class SectionMain extends React.Component {
    static contextType = Context;

    onUserMedia() {
        this.context.media.getUserMedia({
            callback: this.props.onStream.bind(this),
        });
    }
    
    onAudioMedia() {
        this.context.media.getUserMedia({
            callback: this.props.onStream.bind(this),
            partial: {
                video: false
            }
        });
    }
    
    onDisplayMedia() {
        this.context.display.getDisplayMedia({
            callback: this.props.onStream.bind(this),
        });
    }

    render() {
        return (
            <div className="section" id="section-main">
                <div className="group">
                    <button className="ribbon-button" onClick={ this.onUserMedia.bind(this) }>
                        <span className="icon">
                            <span className="mif-video-camera"></span>
                        </span>
                        
                        <span className="caption">Video</span>
                    </button>
                    
                    <button className="ribbon-button" onClick={ this.onAudioMedia.bind(this) }>
                        <span className="icon">
                            <span className="mif-mic"></span>
                        </span>
                        
                        <span className="caption">Audio</span>
                    </button>

                    <button className="ribbon-button" onClick={ this.onDisplayMedia.bind(this) }>
                        <span className="icon">
                            <span className="mif-display"></span>
                        </span>
                        
                        <span className="caption">Screen</span>
                    </button>
                    
                    <button className="ribbon-button">
                        <span className="icon">
                            <span className="mif-file-image"></span>
                        </span>
                        
                        <span className="caption">Canvas</span>
                    </button>
                    
                    <button className="ribbon-button">
                        <span className="icon">
                            <span className="mif-piano"></span>
                        </span>
                        
                        <span className="caption">Sound</span>
                    </button>
                    
                    <button className="ribbon-button">
                        <span className="icon">
                            <span className="mif-squirrel"></span>
                        </span>
                        
                        <span className="caption">Squirrel</span>
                    </button>
                    
                    <span className="title">Streams</span>
                </div>
            </div>
        );
    }
};