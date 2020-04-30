import Port from "./Port";

export default class Node {
    constructor({ input, output } = {}) {
        this._ports = {
            input,
            output
        };
    }

    inport(index) {
        let port = Object.keys(this._ports.input)[ index ];

        if(port instanceof Port) {
            return port;
        }

        return false;
    }
    outport(index) {
        let port = Object.keys(this._ports.output)[ index ];

        if(port instanceof Port) {
            return port;
        }

        return false;
    }

    /**
     * 
     * @param {Port} port
     * @param {Port.DataType} dataType
     * @param {Signal|any} payload 
     */
    receive(port, dataType, payload) {
        if(port.type === Port.Type.INPUT) {
            // Perform work

            let outport = this.outport("some lookup value");

            if(outport) {
                outport.output("some data or signal");
            }
        } else if(port.type === Port.Type.OUTPUT) {
            // Do something with payload
        }
    }
};