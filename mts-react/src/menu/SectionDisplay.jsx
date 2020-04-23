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
    
    onControlGroupClick(msg) {
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

    onMuteGroupClick(msg) {
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
        return (
            <div className="section" id="section-display">
                <ControlGroup
                    onClick={ this.onControlGroupClick.bind(this) }
                    isPaused={ this.state.isStreamPaused }
                />
                <MuteGroup
                    video={ true }
                    audio={ false }
                    videoIcon={ "mif-display" }
                    isAudioPaused={ false }
                    isVideoPaused={ this.context.display.controller.isVideoPaused() }
                    onClick={ this.onMuteGroupClick.bind(this) }
                />
            </div>
        );
    }
};