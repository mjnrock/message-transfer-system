import React from "react";

import Container from "./Container";
import MediaBar from "./MediaBar";
import StreamView from "./StreamView";
import Infobar from "./Infobar";
// import Toolbar from "./Toolbar";

import Context from "./Context";

export default class App extends React.Component {
    static contextType = Context;

    constructor(props) {
        super(props);

        this.state = {
            stream: null,
            message: "",
            messages: [
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero praesentium, eos provident in soluta hic quaerat nulla dolor rem dicta nostrum id reiciendis laboriosam pariatur voluptatibus tenetur neque earum molestiae?",
            ],
        };
    }
    
    feedback(message, ...args) {
        if(message === "update") {
            this.forceUpdate();
        }
    }

    updateStream(stream) {
        this.setState({
            ...this.state,
            stream
        });
    }

    onMessageEntry(e) {
        this.setState({
            ...this.state,
            message: e.target.value
        });
    }
    sendMessage() {
        let message = this.state.message;

        this.setState({
            ...this.state,
            messages: [
                ...this.state.messages,
                message
            ],
            message: ""
        });
    }

    render() {
        const info = {
            width: null,
            height: null,
            fps: null,
        };
        
        if(this.context.getVideoTracks(0)) {
            let settings = this.context.getVideoTracks(0).getSettings();

            info.width = settings.width;
            info.height = settings.height;
            info.fps = settings.frameRate;
        }

        return (
            <Container>
                <MediaBar feedback={ this.feedback.bind(this) } streamUpdater={ this.updateStream.bind(this) } />

                <Container>
                    <Container className="flex items-start">
                        <Container className="w-80 flex flex-wrap items-start justify-center">
                            <StreamView stream={ this.context.stream } width={ 640 } height={ 480 }/>
                        </Container>
                        
                        <Container className="w-20 bg-white black">
                            <div className="overflow-y-scroll">
                                {
                                    this.state.messages.map((text, i) => (
                                        <div key={ i } className="panel ma1 pa2 br2">{ text }</div>
                                    ))
                                }
                            </div>
                            
                            <Infobar className="bg-white">
                                <input type="text" onChange={ this.onMessageEntry.bind(this) } onKeyUp={ e => e.which === 13 ? this.sendMessage() : null } value={ this.state.message } placeholder="Enter a message..." />
                                <button onClick={ this.sendMessage.bind(this) }>Send</button>
                            </Infobar>
                        </Container>
                    </Container>

                    <Infobar className="code ba br pa3">
                        {
                            info.width
                            ? (<span>{ info.width } x { info.height } [{ info.fps }]</span>)
                            : null
                        }
                    </Infobar>
                </Container>
            </Container>
        )
    };
};