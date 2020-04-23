/* eslint-disable */
import React from "react";

import Context from "./Context";

export default class DeviceGroup extends React.Component {
    static contextType = Context;

    render() {
        if(this.context.stream && this.context.stream.active) {
            const { videoinput, audioinput } = this.context.devices;

            return (
                <div className="group">                            
                    {
                        this.context.tracks.video && this.context.getCurrentVideoDevice() && this.context.videoStreamType === "video" ? (
                            <div>
                                <button className="ribbon-button dropdown-toggle">
                                    <span className="icon">
                                        <span className="mif-video-camera fg-darkGray"></span>
                                    </span>
                                    <span className="caption">Camera</span>
                                </button>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">
                                    {
                                        (Object.values(videoinput) || []).map((device, i) => (
                                            <li key={ device.id } className={ device.id === this.context.getCurrentVideoDevice().id ? "checked" : null }>
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
                        this.context.tracks.audio && this.context.getCurrentAudioDevice() ? (
                            <div>
                                <button className="ribbon-button dropdown-toggle">
                                    <span className="icon">
                                        <span className="mif-mic fg-darkGray"></span>
                                    </span>
                                    <span className="caption">Mic</span>
                                </button>
                                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">                                            
                                    {
                                        (Object.values(audioinput) || []).map((device, i) => (
                                            <li key={ device.id } className={ device.id === this.context.getCurrentAudioDevice().id ? "checked" : null }>
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