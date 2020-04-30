import Node from "./Node";
import Signal from "./Signal";

export default class Port {
    static Type = {
        INPUT: 1,
        OUTPUT: 2,
        // MIXED: 3,
    };

    static DataType = {
        SIGNAL: 1,
        DATA: 2,
    };

    constructor(source, { filter, listeners, type } = {}) {
        this._source = source;
        this._listeners = {};
        // this._type = type || Port.Type.MIXED;
        this._type = type;
        this._filter = filter;

        if(Array.isArray(listeners)) {
            listeners.forEach(l => this.attach(l));
        }

        if(!(typeof this._source === "function")) {
            throw new Error(`Ports must have a source Node.`);
        }

        if(!(typeof this._filter === "function")) {
            throw new Error(`Ports must have a filtering function.  To accept any input, use "() => true"`);
        }
    }

    attach(node) {
        if(node instanceof Node) {

        }
    }
    detach(node) {
        if(node instanceof Node) {
            
        }
    }

    // input(value) {
    //     if(value instanceof Signal) {
    //         // Signal
    //     } else {
    //         // Data
    //     }
    // }
    // output(signal) {
    //     for(let listener of Object.values(this._listeners)) {
    //         if(listener instanceof Node) {
    //             listener.receive(signal);
    //         } else if(typeof listener === "function") {
    //             listener(signal);
    //         }
    //     }
    // }
};