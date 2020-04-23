/* eslint-disable */
import React from "react";

export default class DeviceGroup extends React.Component {
    render() {
        const device = this.props.device;

        return (
            <li className={ device.isCurrent ? "checked" : null }>
                <a href="#" onClick={ e => this.UpdateTheCurrentDevice() }>
                    { device.label }
                </a>
            </li>
        );
    }
};