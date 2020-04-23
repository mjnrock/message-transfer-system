import React from "react";

import ControlGroup from "./ControlGroup";
import MuteGroup from "./MuteGroup";

export default class SectionDisplay extends React.Component {
    render() {
        return (
            <div className="section" id="section-display">
                <ControlGroup />
            </div>
        );
    }
};