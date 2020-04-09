import { GenerateUUID } from "./util/helper";
import Node from "./Node";
import Signal from "./Signal";

export default class Feed {
    constructor(source, { name = null, listeners = {} } = {}) {
        this.id = GenerateUUID();
        this.name = name || GenerateUUID();

        if(!(source instanceof Node)) {
            throw new Error(`[REQUIRED]: [@source] must be a <Node>`);
        }

        this._source = source;
        this._listeners = listeners || {};
    }

    get signet() {
        return `${ this.name }<${ this.id }>`;
    }

    get source() {
        return this._source;
    }
    get listeners() {
        return this._listeners;
    }

    listen(nodeOrFn) {
        if(nodeOrFn instanceof Node || typeof nodeOrFn === "function") {
            let name = nodeOrFn.id || GenerateUUID();
            this._listeners[ name ] = nodeOrFn;

            return name;
        }

        return false;
    }
    unlisten(nameOrNode) {
        if(nodeOrFn instanceof Node) {
            delete this._listeners[ nameOrNode.id ];

            return true;
        } else if(typeof nameOrNode === "string" || nameOrNode instanceof String) {
            delete this._listeners[ nameOrNode ];

            return true;
        }

        return false;
    }

    emit(type, payload, { shape } = {}) {
        let signal,
            info = {
                id: this.id,
                name: this.name,    // At a root level Feed, this will be the Node's signet
                signet: this.signet
            };
            
        if(Signal.conforms(type)) {
            signal = type;
        } else {
            signal = new Signal(type, payload, { shape });
        }

        for(let subscriber of Object.values(this._listeners)) {
            if(subscriber instanceof Node) {
                subscriber.receive(signal, info);
            } else if(typeof subscriber === "function") {
                subscriber(signal, info);
            }
        }
    }
};