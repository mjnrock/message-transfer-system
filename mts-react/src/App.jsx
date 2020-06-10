import React from "react";

import Context from "./Context";

import Ribbon from "./menu/Ribbon";
import StreamView from "./StreamView";

export default class App extends React.Component {
    static contextType = Context;

    onStream() {
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <Ribbon onStream={ this.onStream.bind(this) } />

                <StreamView className="ma0" width={ 640 } height={ 480 } stream={ this.context.media.stream } />
                <StreamView className="ma0" width={ 640 } height={ 480 } stream={ this.context.display.stream } />
            </div>
        );
    }
};