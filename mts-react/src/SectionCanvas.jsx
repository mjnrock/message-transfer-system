import React from "react";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class SectionCanvas extends React.Component {
    render() {
        return (
            <div className="section" id="section-canvas">
                <ControlGroup />
            </div>
        );
    }
};