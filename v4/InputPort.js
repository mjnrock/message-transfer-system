import Signal from "./Signal";
import Port from "./Port";

export default class InputPort extends Port {
    constructor(source, filter) {
        super(source, { filter, type: Port.Type.INPUT, listeners: [ source ] });
    }

    input(payload) {
        let type = payload instanceof Signal ? Port.DataType.SIGNAL : Port.DataType.DATA;

        // Don't perform work unless the port was given data in alignment to its purpose
        if(this._filter(type, payload) === true) {
            this._source.receive(this, type, payload);
        }
    }
};