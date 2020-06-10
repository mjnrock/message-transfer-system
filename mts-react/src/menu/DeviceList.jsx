/* eslint-disable */
import React from "react";

import DeviceListItem from "./DeviceListItem";

export default class DeviceList extends React.Component {
    onDeviceChange(device) {
        if(this.props.onDeviceChange) {
            this.props.onDeviceChange(device);
        }
    }

    render() {        
        return (
            <div>
                <button className="ribbon-button dropdown-toggle">
                    <span className="icon">
                        <span className={ this.props.iconClass }></span>
                    </span>
                    <span className="caption">{ this.props.title }</span>
                </button>
                <ul className="ribbon-dropdown" data-role="dropdown" data-duration="100">
                    {
                        this.props.devices.map((device, i) => {
                            let isCurrent = this.props.current.includes(device.id);

                            return (
                                <DeviceListItem key={ device.id } device={ device } isCurrent={ isCurrent } onClick={ this.onDeviceChange.bind(this) } />
                            );
                        })
                    }
                </ul>
            </div>
        );
    }
};