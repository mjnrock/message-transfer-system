import React from "react";

export default class StreamView extends React.Component {
    constructor(props) {
        super(props);

        this.video = React.createRef();
    }

    componentDidUpdate() {
        this.video.current.srcObject = this.props.stream;
    }

    render() {
        return (
            <div className={ `bg-silver ${ this.props.className || null }` }>
                <video ref={ this.video } width={ this.props.width || null } height={ this.props.height || null } autoPlay={ true } controls={ true }></video>
            </div>
        );
    }
};