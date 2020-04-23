/* eslint-disable */
import React from "react";

export default class ControlGroup extends React.Component {

    render() {
        return (
            <div className="group">
                <button className="ribbon-button fg-grayBlue">
                    <span className="icon">
                        <span className="mif-pause"></span>
                    </span>
                    
                    <span className="caption">Pause</span>
                </button>

                <button className="ribbon-button fg-emerald">
                    <span className="icon">
                        <span className="mif-play"></span>
                    </span>
                    
                    <span className="caption">Resume</span>
                </button>

                <button className="ribbon-button fg-red">
                    <span className="icon">
                        <span className="mif-stop"></span>
                    </span>
                    
                    <span className="caption">Stop</span>
                </button>
                
                <span className="title">Controls</span>
            </div>
        );
    }
};