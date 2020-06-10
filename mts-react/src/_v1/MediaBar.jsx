/* eslint-disable */
import React from "react";

import Context from "./Context";

import DeviceGroup from "./DeviceGroup";
import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class MediaBar extends React.Component {
    static contextType = Context;
    
    feedback(message, ...args) {
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
        } else if(message === "change.audio") {
            let device = args[ 0 ];
            this.context.useDevice(device, {
                callback: stream => this.props.feedback("update")
            });
        } else if(message === "change.video") {
            let device = args[ 0 ];
            this.context.useDevice(device, {
                callback: stream => this.props.feedback("update")
            });
        }

        this.forceUpdate();
    }

    componentDidMount() {
        this.context.getMediaDevices().then(() => {
            this.forceUpdate();
        });
    }

    onAudioChange(e, device) {
        this.props.feedback("change.audio", device);
    }
    onVideoChange(e, device) {
        this.props.feedback("change.audio", device);
    }

    // TODO Add canvas drawing
    // onShareCanvasMedia(e) {
    //     this.context.getCanvasMedia({
    //         callback: this.props.streamUpdater,
    //     });
    // }
    onShareDisplayMedia(e) {
        this.context.getDisplayMedia({
            callback: stream => this.props.feedback("update"),
        });
    }
    onShareUserMedia(e) {
        this.context.getUserMedia({
            callback: stream => this.props.feedback("update"),
        });
    }
    onShareMicMedia(e) {
        this.context.getUserMedia({
            callback: stream => this.props.feedback("update"),
            constraints: {
                audio: true,
                video: false
            },
        });
    }

    render() {
        return (
            <nav data-role="ribbonmenu" className="bg-lightCobalt">
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
                            
                            <button className="ribbon-button" onClick={ this.onShareUserMedia.bind(this) }>
                                <span className="icon">
                                    <span className="mif-video-camera"></span>
                                </span>
                                
                                <span className="caption">Video</span>
                            </button>
                            
                            <button className="ribbon-button" onClick={ this.onShareMicMedia.bind(this) }>
                                <span className="icon">
                                    <span className="mif-mic"></span>
                                </span>
                                
                                <span className="caption">Audio</span>
                            </button>
                            
                            <span className="title">Streams</span>
                        </div>
                        
                        <ControlGroup feedback={ this.feedback.bind(this) } />
                        <MuteGroup feedback={ this.feedback.bind(this) } />
                        <DeviceGroup feedback={ this.feedback.bind(this) } />
                    </div>
                </div>
            </nav>
        );
    }
};