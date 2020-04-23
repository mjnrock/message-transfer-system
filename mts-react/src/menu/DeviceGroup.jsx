/* eslint-disable */
import React from "react";
import DeviceList from "./DeviceList";

export default class DeviceGroup extends React.Component {
    onDeviceChange(device) {
        this.props.onMessage("cmd.device", device);
    }

    render() {
        const audio = this.props.audio || [];
        const video = this.props.video || [];

        if(!(video.length || audio.length)) {
            return null;
        }

        return (
            <div className="group">                
                { video.length ? <DeviceList title="Video" iconClass={ `mif-video-camera fg-darkGray` } current={ this.props.current.video } devices={ video } onDeviceChange={ this.onDeviceChange.bind(this) } /> : null }
                { audio.length ? <DeviceList title="Audio" iconClass={ `mif-mic fg-darkGray` } current={ this.props.current.audio } devices={ audio } onDeviceChange={ this.onDeviceChange.bind(this) } /> : null }
                
                <span className="title">Devices</span>
            </div>
        );
    }
};