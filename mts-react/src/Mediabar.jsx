import React from "react";

import Context from "./Context";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class Mediabar extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);
        
        this.state = {
            isActive: false,
            isPaused: true,
            isAudioMuted: false,
            isVideoMuted: false,
        };
    }
    
    feedback(message) {
        if(message === "stream.pause") {
            this.context.pause(); 
            
            this.setState({
                ...this.state,
                isPaused: true,
                isAudioMuted: true,
                isVideoMuted: true,
            });
        } else if(message === "stream.play") {
            this.context.play(); 

            this.setState({
                ...this.state,
                isPaused: false,
                isAudioMuted: false,
                isVideoMuted: false,
            });
        } else if(message === "stream.stop") {
            this.context.stop(); 

            this.setState({
                ...this.state,
                isActive: false,
                isPaused: true,
                isAudioMuted: true,
                isVideoMuted: true,

                hasAudio: false,
                hasVideo: false,
            });
        } else if(message === "stream.audio.mute") {
            this.context.getAudioTracks(0).enabled = !this.context.getAudioTracks(0).enabled;

            this.setState({
                ...this.state,
                isAudioMuted: !this.state.isAudioMuted,
            });
        } else if(message === "stream.video.mute") {
            this.context.getVideoTracks(0).enabled = !this.context.getVideoTracks(0).enabled;

            this.setState({
                ...this.state,
                isVideoMuted: !this.state.isVideoMuted,
            });
        }
    }

    componentDidMount() {
        if(!this.props.streamUpdater) {
            throw new Error(`"streamUpdater" is a required prop and expects a callback function`);
        }

        this.context.getMediaDevices().then(() => {
            this.forceUpdate();
        });
    }

    activate() {
        this.setState({
            isActive: true,
            isPaused: false,
            isAudioMuted: false,
            isVideoMuted: false,
        });
    }
    deactivate() {
        this.setState({
            isActive: false,
            isPaused: true,
            isAudioMuted: true,
            isVideoMuted: true,
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
            callback: stream => {
                this.props.streamUpdater(stream);
                this.activate();

                this.setState({
                    ...this.state,
                    hasAudio: false,
                    hasVideo: true,
                });
            },
        });
    }
    onShareUserMedia(e) {
        this.context.getUserMedia({
            callback: stream => {
                this.props.streamUpdater(stream);
                this.activate();

                this.setState({
                    ...this.state,
                    hasAudio: true,
                    hasVideo: true,
                });
            },
        });
    }
    onShareMicMedia(e) {
        this.context.getUserMedia({
            callback: stream => {
                this.props.streamUpdater(stream);
                this.activate();

                this.setState({
                    ...this.state,
                    hasAudio: true,
                    hasVideo: false,
                });
            },
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
                        
                        <ControlGroup display={ this.state } feedback={ this.feedback.bind(this) } />
                        <MuteGroup display={ this.state } feedback={ this.feedback.bind(this) } />
                    </div>
                </div>
            </nav>
        );
    }
};