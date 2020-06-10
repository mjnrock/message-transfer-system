/* eslint-disable */
import React from "react";

export default class ControlGroup extends React.Component {
    render() {
        return (
            <div className="group">
                {
                    this.props.isPaused ? (
                        <button className="ribbon-button fg-emerald" onClick={ e => this.props.onMessage("cmd.play") }>
                            <span className="icon">
                                <span className="mif-play"></span>
                            </span>
                            
                            <span className="caption">Play</span>
                        </button>
                    ) : (
                        <button className="ribbon-button fg-grayBlue" onClick={ e => this.props.onMessage("cmd.pause") }>
                            <span className="icon">
                                <span className="mif-pause"></span>
                            </span>
                            
                            <span className="caption">Pause</span>
                        </button>
                    )
                }

                <button className="ribbon-button fg-red" onClick={ e => this.props.onMessage("cmd.stop") }>
                    <span className="icon">
                        <span className="mif-cancel"></span>
                    </span>
                    
                    <span className="caption">End</span>
                </button>
                
                <span className="title">Controls</span>
            </div>
        );
    }
};