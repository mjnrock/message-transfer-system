import React from "react";

import Container from "./Container";
import StreamView from "./StreamView";
import Infobar from "./Infobar";
import Toolbar from "./Toolbar";

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

    componentDidMount() {
        this.context.getMediaDevices().then(() => {
            this.forceUpdate();
        });
    }

    onAudioChange(e) {
        // Refresh stream rendering, perform other actions
    }
    onVideoChange(e) {
        // Refresh stream rendering, perform other actions
    }

    onShareDisplayMedia(e) {
        this.context.getDisplayMedia({
            callback: stream => {
                this.setState({
                    ...this.state,
                    stream
                });
            }
        });
    }
    onShareUserMedia(e) {
        this.context.getUserMedia({
            callback: stream => {
                this.setState({
                    ...this.state,
                    stream
                });
            }
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
                <Container>
                    <Toolbar className="ba br pa3">
                        <select name="audio-devices" id="audio-devices" onChange={ this.onAudioChange.bind(this) }>
                            { Object.values(this.context.devices.audio).map(device => (
                                <option key={ device.id } value={ device.id }>{ device.label }</option>
                            ))}
                        </select>
                        <select name="video-devices" id="video-devices" onChange={ this.onVideoChange.bind(this) }>
                            { Object.values(this.context.devices.video).map(device => (
                                <option key={ device.id } value={ device.id }>{ device.label }</option>
                            ))}
                        </select>

                        <button onClick={ this.onShareDisplayMedia.bind(this) }>Display</button>
                        <button onClick={ this.onShareUserMedia.bind(this) }>User</button>
                        
                        <button onClick={ e => this.context.stop() }>Stop</button>
                        <button onClick={ e => this.context.pause() }>Pause</button>
                        <button onClick={ e => this.context.play() }>Play</button>
                    </Toolbar>

                    <Container className="flex items-start">
                        <Container className="w-80 flex flex-wrap items-start justify-center">
                            <StreamView stream={ this.state.stream } width={ 640 } height={ 480 }/>
                        </Container>
                        
                        <Container className="w-20 bg-white black">
                            <div className="overflow-scroll">
                                {
                                    this.state.messages.map((text, i) => (
                                        <div key={ i } className="ba br2 pa2 ma1">{ text }</div>
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