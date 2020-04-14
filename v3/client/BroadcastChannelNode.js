import { GenerateUUID } from "./../util/helper";
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

    constructor({ name, receive, isPublic = false } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });

        this.supply = {
            Name: null,
            Channel: null
        };
    }

    getName() {
        return this.supply.Name || false;
    }

    connect(name) {
        let bc = new BroadcastChannel(name);

        bc.onmessage = this._onBcMessage.bind(this);
        bc.onmessageerror = this._onBcMessageError.bind(this);

        this.supply.Name = name;
        this.supply.Channel = bc;

        return this;
    }
    disconnect() {
        if(this.supply.Channel instanceof BroadcastChannel) {
            this.supply.Channel.close();

            this.supply.Name = null;
            this.supply.Channel = null;
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
                this.supply.Channel.postMessage(msg);
            }
        } catch(e) {
            this.emit(BroadcastChannelNode.SignalTypes.ERROR, e);
        }
    }

    _onBcMessage(e) {        
        try {
            let msg = e.data;

            if(Message.conforms(msg)) {
                this.emit(msg);
            }
        } catch(e) {
            this._onBcMessageError(e);
        }
    }
    _onBcMessageError(e) {
        this.emit(BroadcastChannelNode.SignalTypes.MESSAGE_ERROR, e);
    }
};