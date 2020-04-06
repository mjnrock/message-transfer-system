import { Bitwise, GenerateUUID, Dice } from "./helper";
import Node from "./Node";
import Message from "./Message";

export default class Repeater extends Node {
    static SignalType = {
        TICK: "Repeater.Tick",
        RENDER: "Repeater.Render",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(Repeater.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    static BroadcastType = {
        MESSAGE: 2 << 0,
        SUBSCRIPTION: 2 << 1
    };

    constructor({ name = null, broadcastType = Repeater.BroadcastType.MESSAGE, receive = null, mnode = null, packager = null } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            mnode: mnode,
            packager: packager
        });

        this.internal = {
            BroadcastType: 0,
            Intervals: {}
        };

        this.setBroadcastType(broadcastType);
    }

    setBroadcastType(bts) {
        if(Array.isArray(bts)) {
            this.internal.BroadcastType = bts.reduce((a, v) => {
                return Bitwise.add(a, v);
            }, 0);
        } else if(typeof bts === "number") {
            this.internal.BroadcastType = bts;
        }
    }

    addCommand(...args) {
        if(typeof args[ 0 ] === "function" && typeof args[ 1 ] === "number") {
            return this.addInterval(...args);
        } else if(Message.conforms(args[ 0 ]) && typeof args[ 1 ] === "number") {
            return this.addMessager(args[ 0 ].type, args[ 0 ].payload, args[ 1 ]);
        } else if(args[ 0 ] && args[ 1 ] && typeof args[ 2 ] === "number") {
            return this.addMessager(...args);
        }
    }
    clearInterval(nameOrId) {
        if(typeof nameOrId === "string" || nameOrId instanceof String || typeof nameOrId === "number") {
            clearInterval(this.internal.Intervals[ nameOrId ]);
            delete this.internal.Intervals[ nameOrId ];
        }
    }

    addInterval(callback, interval, { name = null } = {}) {
        let id = setInterval(() => {
            callback(this._mnode, this);
        }, interval);

        this.internal.Intervals[ name || id ] = id;

        return name || id;
    }
    addRandomInterval(callback, min, max, { name = null } = {}) {
        let id = this.addInterval(() => {
            callback(this._mnode, this);

            this.clearInterval(id);
            this.addRandomInterval(callback, min, max, { name });
        }, Dice.random(min, max), { name });
    }


    addMessager(type, payload, interval, { name = null } = {}) {
        let id = setInterval(() => {
            if(Bitwise.has(this.internal.BroadcastType, Repeater.BroadcastType.MESSAGE)) {
                this.send(type, payload, { defaultConfig: false });
            }
            if(Bitwise.has(this.internal.BroadcastType, Repeater.BroadcastType.SUBSCRIPTION)) {
                this.emit(type, payload);
            }
        }, interval);

        this.internal.Intervals[ name || id ] = id;

        return name || id;
    }
};