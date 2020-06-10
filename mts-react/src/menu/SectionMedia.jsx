/* eslint-disable */
import React from "react";

import Context from "./../Context";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";
import DeviceGroup from "./DeviceGroup";
import ResolutionGroup from "./ResolutionGroup";

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
    
    onControlGroupMessage(msg) {
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

    onMuteGroupMessage(msg) {
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
    
    onDeviceGroupMessage(msg, ...args) {
        if(msg === "cmd.device") {
            let [ device ] = args;

            this.context.media.useDevice(device, {
                callback: this.props.onStream.bind(this),
            });
        }
    }
    
    onResolutionGroupMessage(msg, ...args) {
        if(msg === "cmd.resolution") {
            let [ width, height ] = args;

            this.context.media.changeResolution({
                width,
                height,
                callback: this.props.onStream.bind(this),
            });
        }
    }

    render() {
        if(this.context.media.stream && this.context.media.stream.active) {        
            const { audioinput, videoinput } = this.context.media.devices;
            const current = this.context.media.getCurrentDevices();
    
            return (
                <div className="section" id="section-media">
                    <ControlGroup
                        onMessage={ this.onControlGroupMessage.bind(this) }
                        isPaused={ this.state.isStreamPaused }
                    />
                    <MuteGroup
                        video={ true }
                        audio={ true }
                        onMessage={ this.onMuteGroupMessage.bind(this) }
                        isAudioPaused={ this.context.media.controller.isAudioPaused() }
                        isVideoPaused={ this.context.media.controller.isVideoPaused() }
                    />
                    <DeviceGroup
                        video={ videoinput }
                        audio={ audioinput }
                        current={ current }
                        onMessage={ this.onDeviceGroupMessage.bind(this) }
                    />
                    <ResolutionGroup                        
                        onMessage={ this.onResolutionGroupMessage.bind(this) }
                    />
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