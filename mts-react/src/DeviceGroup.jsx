/* eslint-disable */
import React from "react";

import Context from "./Context";

export default class DeviceGroup extends React.Component {
    static contextType = Context;

    render() {
        if(this.props.display.isActive) {
            const { video, audio } = this.context.devices;

            return (
                <div className="group">                            
                    {
                        this.props.display.hasVideo ? (
                            <div>
                                <button className="ribbon-button dropdown-toggle">
                                    <span className="icon">
                                        <span className="mif-video-camera fg-darkGray"></span>
                                    </span>
                                    <span className="caption">Camera</span>
                                </button>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">
                                    {
                                        (Object.values(video) || []).map((device, i) => (
                                            <li key={ device.id } className={ this.context.currentVideoDevice && device.id === this.context.currentVideoDevice.id ? "checked" : null }>
                                                <a href="#" onClick={ e => this.props.feedback("change.video", device) }>
                                                    { device.label }
                                                </a>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ) : null
                    }

                    {
                        this.props.display.hasAudio ? (
                            <div>
                                <button className="ribbon-button dropdown-toggle">
                                    <span className="icon">
                                        <span className="mif-mic fg-darkGray"></span>
                                    </span>
                                    <span className="caption">Mic</span>
                                </button>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">                                            
                                    {
                                        (Object.values(audio) || []).map((device, i) => (
                                            <li key={ device.id } className={ this.context.currentAudioDevice && device.id === this.context.currentAudioDevice.id ? "checked" : null }>
                                                <a href="#" onClick={ e => this.props.feedback("change.audio", device) }>
                                                    { device.label }
                                                </a>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        ) : null
                    }
                    
                    <span className="title">Devices</span>
                </div>
            );
        }

        return null;
    }
};