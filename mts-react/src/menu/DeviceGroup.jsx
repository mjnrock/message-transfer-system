/* eslint-disable */
import React from "react";
import DeviceList from "./DeviceList";

export default class DeviceGroup extends React.Component {
    render() {
        const dummyList = [
            {
                id: `${ Date.now() }:${ ~~(Math.random() * 100000) }`,
                label: `${ Date.now() }:${ ~~(Math.random() * 100000) }`,
                isCurrent: true
            },
            {
                id: `${ Date.now() }:${ ~~(Math.random() * 100000) }`,
                label: `${ Date.now() }:${ ~~(Math.random() * 100000) }`,
                isCurrent: false
            }
        ];

        return (
            <div className="group">                
                <DeviceList title="Video" iconClass={ `mif-video-camera fg-darkGray` } devices={ dummyList } />
                <DeviceList title="Audio" iconClass={ `mif-mic fg-darkGray` } devices={ dummyList } />
                
                <span className="title">Devices</span>
            </div>
        );
    }
};