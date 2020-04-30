import Signal from "./Signal";
import Port from "./Port";
import InputPort from "./InputPort";

export default class OutputPort extends Port {
    constructor(source, { filter, listeners } = {}) {
        super(source, { filter, type: Port.Type.OUTPUT, listeners });
    }

    output(payload) {
        let type = payload instanceof Signal ? Port.DataType.SIGNAL : Port.DataType.DATA;

        // Don't perform work unless the port was given data in alignment to its purpose
        if(this._filter(type, payload) === true) {
            for(let listener of Object.values(this._listeners)) {
                if(listener instanceof InputPort) {
                    listener.input(payload);
                }
                
                //? Unsure if these should be used yet
                // else if(listener instanceof Node) {
                //     listener.receive(this, type, value);
                // } else if(typeof listener === "function") {
                //     listener(value);
                // }
            }
        }
    }
};