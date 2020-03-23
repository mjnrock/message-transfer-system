import { GenerateUUID } from "./helper";
import Message from "./Message";

export default class Node {
    constructor(name, { receive = null, parent = null, packager = null } = {}) {
        this.id = GenerateUUID();
        this.name = name;

        this._parent = parent;
        this._packager = packager || ((type, payload, source = null) => new Message(type, payload, source || this.signet));
        this._receive = receive;
        this._subscriptions = {};

        this._state = {};
        this._emitStateChange = false;
        this._emitOnSend = false;
    }

    toggleSimulcast() {
        this._emitOnSend = !this._emitOnSend;

        return this;
    }

    makePublic() {
        this._emitStateChange = true;

        return this;
    }
    makePrivate() {
        this._emitStateChange = false;

        return this;
    }

    get state() {
        return this._state;
    }
    set state(value) {
        if(this._emitStateChange === true) {
            this.emit(`state::${ this.signet }`, {
                previous: this._state,
                current: value
            });
        }
        
        this._state = value;
    }

    get signet() {
        return this.id;
    }

    get receive() {
        return this._receive;
    }
    set receive(fn) {
        if(typeof fn === "function") {
            this._receive = fn;

            return true;
        }

        return false;
    }

    get packager() {
        return this._packager;
    }
    set packager(fn) {
        if(typeof fn === "function") {
            this._packager = fn;

            return true;
        }

        return false;
    }

    send(type, payload, { defaultConfig = true } = {}) {
        this.message(this.packager(
            type,
            payload,
            this.signet
        ), { defaultConfig });
    }
    message(msg, { defaultConfig = true } = {}) {
        if(Message.conforms(msg)) {
            this._parent.Router.route(msg);

            if(defaultConfig === true && this._emitOnSend === true) {
                this.emit(msg);
            }
        }
    }

    emit(type, payload) {
        let msg;
        if(Message.conforms(type)) {
            msg = type;
        } else {
            msg = this.packager(
                type,
                payload,
                this.signet
            );
        }

        for(let sub of Object.values(this._subscriptions)) {
            if(typeof sub.receive === "function") {
                sub.receive(msg);
            } else if(typeof sub === "function") {
                sub(msg);
            }
        }

        return this;
    }

    subscribe(nodeOrFn) {
        let id,
            sub;

        if(nodeOrFn instanceof Node) {
            sub = nodeOrFn;
            id = nodeOrFn.id;
        } else if(typeof nodeOrFn === "function" || typeof nodeOrFn.receive === "function") {
            sub = nodeOrFn;
            id = GenerateUUID();
        }

        if(id) {
            this._subscriptions[ id ] = sub;

            return id;
        }

        return false;
    }

    subscribeTo(node) {
        if(node instanceof Node) {
            return node.subscribe(this);
        }

        return false;
    }
    
    unsubscribe(nodeFnOrId) {
        let hashCode = str => {
            let hash = 0, i, chr;

            if(str.length === 0) {
                return hash;
            }

            for(i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        };

        if (nodeFnOrId instanceof Node) {
            delete this._subscriptions[ nodeFnOrId.id ];
        } else if (typeof nodeFnOrId === "string" || nodeFnOrId instanceof String) {
            delete this._subscriptions[ nodeFnOrId ];
        } else if (typeof nodeFnOrId.receive === "function" || typeof nodeFnOrId === "function") {
            let fn = nodeFnOrId.receive || nodeFnOrId,
                hash = hashCode(fn.toString());

            for (let [ key, sub ] of Object.entries(this._subscriptions)) {
                if (typeof sub.receive === "function" || typeof sub === "function") {
                    let ifn = sub.receive || sub;

                    if (hashCode(ifn.toString()) === hash) {
                        delete this._subscriptions[key];

                        return this;
                    }
                }
            }
        }

        return this;
    }

    unsubscribeTo(node) {
        if(node instanceof Node) {
            return node.unsubscribe(this);
        }

        return false;
    }
};