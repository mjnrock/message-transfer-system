/* eslint-disable */
import React from "react";

import Context from "./../Context";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";
import DeviceGroup from "./DeviceGroup";

export default class SectionMedia extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);
        
        this.state = {
            isStreamPaused: false
        }
    }

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
    
    onControlGroupClick(msg) {
        if(msg === "cmd.play") {
            this.context.media.controller.play();
            this.setState({
                ...this.state,
                isStreamPaused: false
            });
        } else if(msg === "cmd.pause") {
            this.context.media.controller.pause();
            this.setState({
                ...this.state,
                isStreamPaused: true
            });
        } else if(msg === "cmd.stop") {
            this.context.media.controller.stop();
        }

        this.forceUpdate();
    }

    onMuteGroupClick(msg) {
        if(msg === "cmd.audio") {
            this.context.media.controller.toggle("audio");
        } else if(msg === "cmd.video") {
            this.context.media.controller.toggle("video");
        }

        if(this.context.media.controller.isAudioPaused() && this.context.media.controller.isVideoPaused()) {
            this.setState({
                ...this.state,
                isStreamPaused: true
            });
        } else if(this.state.isStreamPaused) {
            this.setState({
                ...this.state,
                isStreamPaused: false
            });
        }

        this.forceUpdate();
    }

    render() {
        if(this.context.media.stream) {        
            const { audioinput, videoinput } = this.context.media.devices;
    
            return (
                <div className="section" id="section-media">
                    <ControlGroup
                        onClick={ this.onControlGroupClick.bind(this) }
                        isPaused={ this.state.isStreamPaused }
                    />
                    <MuteGroup
                        video={ true }
                        audio={ true }
                        onClick={ this.onMuteGroupClick.bind(this) }
                        isAudioPaused={ this.context.media.controller.isAudioPaused() }
                        isVideoPaused={ this.context.media.controller.isVideoPaused() }
                    />
                    <DeviceGroup video={ videoinput } audio={ audioinput } />
                </div>
            );
        }
        
        return (
            <div className="section" id="section-media">
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
                </div>
            </div>
        );
    }
};