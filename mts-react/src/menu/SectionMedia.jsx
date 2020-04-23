/* eslint-disable */
import React from "react";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";
import DeviceGroup from "./DeviceGroup";

export default class SectionMedia extends React.Component {
    render() {
        return (
            <div className="section" id="section-media">
                <ControlGroup />
                <MuteGroup video={ true } audio={ true } />
                <DeviceGroup video={ [] } audio={ [] } />
            </div>
        );
    }
};