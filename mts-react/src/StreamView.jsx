import React from "react";

export default class StreamView extends React.Component {
    constructor(props) {
        super(props);

        this.video = React.createRef();
    }

    componentDidUpdate() {
        this.video.current.srcObject = this.props.stream;
    }

    toggleFullScreen() {
        if(!document.fullscreenElement) {
            this.video.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    render() {
        return (
            <video ref={this.video} width={this.props.width || null} height={this.props.height || null} autoPlay={true} controls={false} onDoubleClick={this.toggleFullScreen.bind(this)}></video>
        );
        // return (
        //     <div className={ `bg-silver ${ this.props.className || null }` }>
        //         <video ref={ this.video } width={ this.props.width || null } height={ this.props.height || null } autoPlay={ true } controls={ false }></video>
        //     </div>
        // );
    }
};