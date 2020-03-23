import { GenerateUUID } from "./../helper";
import Node from "./../Node";
import Message from "./../Message";

export default class BroadcastChannelNode extends Node {
    static SignalTypes = {
        MESSAGE: "BroadcastChannelNode.Message",
        MESSAGE_ERROR: "BroadcastChannelNode.MessageError",
        ERROR: "BroadcastChannelNode.Error",
    };
    //* The primary use of this function is for <Router>
    static AllSignalTypes() {
        return Object.values(BroadcastChannelNode.SignalTypes);
    }

    constructor({ parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this.state = {
            Name: null,
            Channel: null
        };
    }

    getName() {
        return this.state.Name || false;
    }

    connect(name) {
        let bc = new BroadcastChannel(name);

        bc.onmessage = this._onBcMessage.bind(this);
        bc.onmessageerror = this._onBcMessageError.bind(this);

        this.state.Name = name;
        this.state.Channel = bc;

        return this;
    }
    disconnect() {
        if(this.state.Channel instanceof BroadcastChannel) {
            this.state.Channel.close();

            this.state.Name = null;
            this.state.Channel = null;
        }

        return this;
    }

    receive(msg) {
        if(Message.conforms(msg) && msg.type === BroadcastChannelNode.SignalTypes.MESSAGE) {
            this.bcmessage(msg.payload);
        }
    }
    bcsend(type, payload) {
        let msg = new Message(type, payload, this.signet);
        
        this.bcmessage(msg);
    }
    bcmessage(msg) {
        try {
            if(Message.conforms(msg)) {
                this.state.Channel.postMessage(msg);
            }
        } catch(e) {
            this.send(BroadcastChannelNode.SignalTypes.ERROR, e);
        }
    }

    _onBcMessage(e) {        
        try {
            let msg = e.data;

            if(Message.conforms(msg)) {
                this.message(msg);
            }
        } catch(e) {
            this._onBcMessageError(e);
        }
    }
    _onBcMessageError(e) {
        this.send(BroadcastChannelNode.SignalTypes.MESSAGE_ERROR, e);
    }
};