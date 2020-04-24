/* eslint-disable */
import React from "react";

export default class ResolutionGroup extends React.Component {
    onResolutionChange(width, height) {
        this.props.onMessage("cmd.resolution", width, height);
    }

    render() {
        const resolutions = [
            [ "240p", 426, 240 ],
            [ "360p", 640, 360 ],
            [ "480p", 854, 480 ],
            [ "720p", 1280, 720 ],
            [ "1080p", 1920, 1080 ],
            [ "4k", 3840, 2160 ],
        ];

        return (
            <div className="group">
                <div className="ribbon-toggle-group">
                    {
                        resolutions.map(([ label, w, h ]) => (
                            <button key={ label } className="ribbon-icon-button" onClick={ e => this.onResolutionChange(w, h) }>
                                    <span className="icon">
                                        <span className="mif-display"></span>
                                    </span>
                                <span className="caption code">{ label }</span>
                            </button>
                        ))
                    }
                </div>
                
                <span className="title">Resolution</span>
            </div>
        );
    }
};