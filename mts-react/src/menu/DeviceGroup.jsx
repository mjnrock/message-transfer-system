/* eslint-disable */
import React from "react";
import DeviceList from "./DeviceList";

export default class DeviceGroup extends React.Component {
    render() {
        const audio = (this.props.audio || []).length;
        const video = (this.props.video || []).length;

        if(!(video.length || audio.length)) {
            return null;
        }

        return (
            <div className="group">                
                { video.length ? <DeviceList title="Video" iconClass={ `mif-video-camera fg-darkGray` } devices={ video } /> : null }
                { audio.length ? <DeviceList title="Audio" iconClass={ `mif-mic fg-darkGray` } devices={ audio } /> : null }
                
                <span className="title">Devices</span>
            </div>
        );
    }
};