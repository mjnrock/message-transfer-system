/* eslint-disable */
import React from "react";

import Context from "./Context";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class Mediabar extends React.Component {
    static contextType = Context;
    
    feedback(message) {
        if(message === "stream.pause") {
            this.context.controller.pause(); 
        } else if(message === "stream.play") {
            this.context.controller.play(); 
        } else if(message === "stream.stop") {
            this.context.controller.stop(); 
        } else if(message === "stream.audio.mute") {
            this.context.controller.toggle("audio");
        } else if(message === "stream.video.mute") {
            this.context.controller.toggle("video");
        }

        this.forceUpdate();
    }

    componentDidMount() {
        if(!this.props.streamUpdater) {
            throw new Error(`"streamUpdater" is a required prop and expects a callback function`);
        }

        this.context.getMediaDevices().then(() => {
            this.forceUpdate();
        });
    }

    onAudioChange(e) {
        // Refresh stream rendering, perform other actions
    }
    onVideoChange(e) {
        // Refresh stream rendering, perform other actions
    }

    onShareDisplayMedia(e) {
        this.context.getDisplayMedia({
            callback: this.props.streamUpdater,
        });
    }
    onShareUserMedia(e) {
        this.context.getUserMedia({
            callback: this.props.streamUpdater,
        });
    }
    onShareMicMedia(e) {
        this.context.getUserMedia({
            callback: this.props.streamUpdater,
            constraints: {
                audio: true,
                video: false
            },
        });
    }

    render() {
        const { video, audio } = this.context.devices;

        return (
            <nav data-role="ribbonmenu">
                <ul className="tabs-holder">
                    <li><a href="#section-main">Main</a></li>
                </ul>
                
                <div className="content-holder">
                    <div className="section" id="section-main">
                        <div className="group">
                            <button className="ribbon-button" onClick={ this.onShareDisplayMedia.bind(this) }>
                                <span className="icon">
                                    <span className="mif-display"></span>
                                </span>
                                
                                <span className="caption">Screen</span>
                            </button>

                            <div className="ribbon-split-button">
                                <button className="ribbon-main" onClick={ this.onShareUserMedia.bind(this) }>
                                    <span className="icon">
                                        <span className="mif-video-camera"></span>
                                    </span>
                                </button>
                                
                                <span className="ribbon-split dropdown-toggle">Camera</span>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">
                                    {
                                        (Object.values(video) || []).map(device => (
                                            <li key={ device.id }>
                                                <a href="#" onClick={ this.onVideoChange.bind(this) }>
                                                    { device.label }
                                                </a>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>

                            <div className="ribbon-split-button">
                                <button className="ribbon-main" onClick={ this.onShareMicMedia.bind(this) }>
                                    <span className="icon">
                                        <span className="mif-mic"></span>
                                    </span>
                                </button>
                                
                                <span className="ribbon-split dropdown-toggle">Mic</span>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">
                                    {
                                        (Object.values(audio) || []).map(device => (
                                            <li key={ device.id }>
                                                <a href="#" onClick={ this.onAudioChange.bind(this) }>
                                                    { device.label }
                                                </a>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                            
                            <span className="title">Input Devices</span>
                        </div>
                        
                        <ControlGroup display={ this.context.check } feedback={ this.feedback.bind(this) } />
                        <MuteGroup display={ this.context.check } feedback={ this.feedback.bind(this) } />
                    </div>
                </div>
            </nav>
        );
    }
};