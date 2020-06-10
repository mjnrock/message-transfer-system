/* eslint-disable */
import React from "react";

export default class DeviceGroup extends React.Component {
    render() {
        const device = this.props.device;

        return (
            <li className={ this.props.isCurrent ? "checked" : null }>
                <a href="#" onClick={ e => this.props.onClick(device) }>
                    { device.label }
                </a>
            </li>
        );
    }
};