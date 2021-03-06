/* eslint-disable */
import React from "react";

import Context from "./Context";

export default class ControlGroup extends React.Component {
    static contextType = Context;

    render() {
        if(this.context.stream && this.context.stream.active) {
            return (
                <div className="group">
                    {
                        (this.context.tracks.audio || this.context.tracks.video) ? (
                            <button className="ribbon-button fg-grayBlue" onClick={ e => this.props.feedback(`stream.pause`) }>
                                <span className="icon">
                                    <span className="mif-pause"></span>
                                </span>
                                
                                <span className="caption">Pause</span>
                            </button>
                        ) : (
                            <button className="ribbon-button fg-emerald" onClick={ e => this.props.feedback(`stream.play`) }>
                                <span className="icon">
                                    <span className="mif-play"></span>
                                </span>
                                
                                <span className="caption">Resume</span>
                            </button>
                        )
                    }

                    <button className="ribbon-button fg-red" onClick={ e => this.props.feedback(`stream.stop`) }>
                        <span className="icon">
                            <span className="mif-stop"></span>
                        </span>
                        
                        <span className="caption">Stop</span>
                    </button>
                    
                    <span className="title">Controls</span>
                </div>
            );
        }

        return null;
    }
};