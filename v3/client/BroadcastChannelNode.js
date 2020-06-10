import { GenerateUUID } from "./../util/helper";
import Node from "./../Node";
import Signal from "./../Signal";

export default class BroadcastChannelNode extends Node {
    static SignalTypes = {
        MESSAGE: "BroadcastChannelNode.Signal",
        MESSAGE_ERROR: "BroadcastChannelNode.SignalError",
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

        bc.onsignal = this._onBcSignal.bind(this);
        bc.onsignalerror = this._onBcSignalError.bind(this);

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

    receive(signal) {
        if(Signal.conforms(signal) && signal.type === BroadcastChannelNode.SignalTypes.MESSAGE) {
            this.bcsignal(signal.payload);
        }
    }
    bcsend(type, payload) {
        let signal = new Signal(type, payload, this.signet);
        
        this.bcsignal(signal);
    }
    bcsignal(signal) {
        try {
            if(Signal.conforms(signal)) {
                this.supply.Channel.postSignal(signal);
            }
        } catch(e) {
            this.emit(BroadcastChannelNode.SignalTypes.ERROR, e);
        }
    }

    _onBcSignal(e) {        
        try {
            let signal = e.data;

            if(Signal.conforms(signal)) {
                this.emit(signal);
            }
        } catch(e) {
            this._onBcSignalError(e);
        }
    }
    _onBcSignalError(e) {
        this.emit(BroadcastChannelNode.SignalTypes.MESSAGE_ERROR, e);
    }
};