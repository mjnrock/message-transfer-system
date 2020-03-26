import { GenerateUUID } from "./../helper";
import Node from "./../Node";
import Message from "./../Message";

export default class BroadcastChannelNode extends Node {
    static SignalTypes = {
        MESSAGE: "BroadcastChannelNode.Message",
        MESSAGE_ERROR: "BroadcastChannelNode.MessageError",
        ERROR: "BroadcastChannelNode.Error",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(BroadcastChannelNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, parent = null, packager = null } = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this.internal = {
            Name: null,
            Channel: null
        };
    }

    getName() {
        return this.internal.Name || false;
    }

    connect(name) {
        let bc = new BroadcastChannel(name);

        bc.onmessage = this._onBcMessage.bind(this);
        bc.onmessageerror = this._onBcMessageError.bind(this);

        this.internal.Name = name;
        this.internal.Channel = bc;

        return this;
    }
    disconnect() {
        if(this.internal.Channel instanceof BroadcastChannel) {
            this.internal.Channel.close();

            this.internal.Name = null;
            this.internal.Channel = null;
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
                this.internal.Channel.postMessage(msg);
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