import React from "react";

import Context from "./../Context";

import SectionMain from "./SectionMain";
import SectionMedia from "./SectionMedia";
import SectionDisplay from "./SectionDisplay";
import SectionCanvas from "./SectionCanvas";

export default class Ribbon extends React.Component {
    static contextType = Context;

    onStream() {
        this.props.onStream();
    }

    render() {
        return (
            <nav data-role="ribbonmenu" className="bg-lightCobalt">
                <ul className="tabs-holder">
                    <li><a href="#section-main">Main</a></li>
                    <li><a href="#section-media">Media</a></li>
                    <li><a href="#section-display">Display</a></li>
                    <li><a href="#section-canvas">Canvas</a></li>
                </ul>
                
                <div className="content-holder">
                    <SectionMain onStream={ this.onStream.bind(this) } />
                    <SectionMedia onStream={ this.onStream.bind(this) } />
                    <SectionDisplay onStream={ this.onStream.bind(this) } />
                    <SectionCanvas onStream={ this.onStream.bind(this) } />
                </div>
            </nav>
        );
    }
};