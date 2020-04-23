/* eslint-disable */
import React from "react";

import Context from "./../Context";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class SectionDisplay extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);
        
        this.state = {
            isStreamPaused: false
        }
    }
    
    onDisplayMedia() {
        this.context.display.getDisplayMedia({
            callback: this.props.onStream.bind(this),
        });
    }
    
    onControlGroupMessage(msg) {
        if(msg === "cmd.play") {
            this.context.display.controller.play();
            this.setState({
                ...this.state,
                isStreamPaused: false
            });
        } else if(msg === "cmd.pause") {
            this.context.display.controller.pause();
            this.setState({
                ...this.state,
                isStreamPaused: true
            });
        } else if(msg === "cmd.stop") {
            this.context.display.controller.stop();
        }

        this.forceUpdate();
    }

    onMuteGroupMessage(msg) {
        if(msg === "cmd.audio") {
            this.context.display.controller.toggle("audio");
        } else if(msg === "cmd.video") {
            this.context.display.controller.toggle("video");
        }

        if(this.context.display.controller.isVideoPaused()) {
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
        if(this.context.display.stream) {
            return (
                <div className="section" id="section-display">
                    <ControlGroup
                        onMessage={ this.onControlGroupMessage.bind(this) }
                        isPaused={ this.state.isStreamPaused }
                    />
                    <MuteGroup
                        video={ true }
                        audio={ false }
                        videoIcon={ "mif-display" }
                        isAudioPaused={ false }
                        isVideoPaused={ this.context.display.controller.isVideoPaused() }
                        onMessage={ this.onMuteGroupMessage.bind(this) }
                    />
                </div>
            );
        }

        return (
            <div className="section" id="section-display">
                <div className="group">
                    <button className="ribbon-button" onClick={ this.onDisplayMedia.bind(this) }>
                        <span className="icon">
                            <span className="mif-display"></span>
                        </span>
                        
                        <span className="caption">Screen</span>
                    </button>
                </div>
            </div>
        );
    }
};