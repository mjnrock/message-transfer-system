import { Bitwise, GenerateUUID } from "./helper";
import Node from "./Node";
import Message from "./Message";

export default class Repeater extends Node {
    static SignalType = {
        TICK: "Repeater.Tick",
        RENDER: "Repeater.Render",
    };

    static BroadcastType = {
        MESSAGE: 2 << 0,
        SUBSCRIPTION: 2 << 1
    };

    constructor({ broadcastType = Repeater.BroadcastType.MESSAGE, parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this.state = {
            BroadcastType: 0,
            Intervals: new Set()
        };

        this.setBroadcastType(broadcastType);
    }

    setBroadcastType(bts) {
        if(Array.isArray(bts)) {
            this.state.BroadcastType = bts.reduce((a, v) => {
                return Bitwise.add(a, v);
            }, 0);
        } else if(typeof bts === "number") {
            this.state.BroadcastType = bts;
        }
    }

    add(...args) {
        if(typeof args[ 0 ] === "function" && typeof args[ 1 ] === "number") {
            return this.addCallback(...args);
        } else if(Message.conforms(args[ 0 ]) && typeof args[ 1 ] === "number") {
            return this.addMessage(args[ 0 ].type, args[ 0 ].payload, args[ 1 ]);
        } else if(args[ 0 ] && args[ 1 ] && typeof args[ 2 ] === "number") {
            return this.addMessage(...args);
        }
    }
    clear(id) {
        if(typeof id === "number") {
            clearInterval(id);
            this.state.Intervals.remove(id);
        }
    }

    addCallback(callback, interval) {
        let id = setInterval(() => {
            callback(this._parent, this);
        }, interval);

        this.state.Intervals.add(id);

        return id;
    }
    addMessage(type, payload, interval) {
        let id = setInterval(() => {
            if(Bitwise.has(this.state.BroadcastType, Repeater.BroadcastType.MESSAGE)) {
                this.send(type, payload);
            }
            if(Bitwise.has(this.state.BroadcastType, Repeater.BroadcastType.SUBSCRIPTION)) {
                this.emit(type, payload);
            }
        }, interval);

        this.state.Intervals.add(id);
        
        return id;
    }
};