import Port from "./Port";
import InputPort from "./InputPort";
import OutputPort from "./OutputPort";

export default class Node {
    constructor({ input, output } = {}) {
        this._ports = {
            input,
            output
        };
    }

    inport(input) {
        if(input instanceof InputPort) {
            return input;
        } else if(typeof input === "string" || input instanceof String) {
            let [ port ] = Object.keys(this._ports.input).filter(p => p.name === input) || [];

            if(port instanceof Port) {
                return port;
            }
        } else if(typeof input === "number") {
            let port = Object.keys(this._ports.input)[ input ];

            if(port instanceof Port) {
                return port;
            }
        }

        return false;
    }
    outport(input) {
        if(input instanceof InputPort) {
            return input;
        } else if(typeof input === "string" || input instanceof String) {
            let [ port ] = Object.keys(this._ports.output).filter(p => p.name === input) || [];

            if(port instanceof Port) {
                return port;
            }
        } else if(typeof input === "number") {
            let port = Object.keys(this._ports.output)[ input ];

            if(port instanceof Port) {
                return port;
            }
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

    in(outport, inport) {
        let inp = this.inport(inport);

        if(inp instanceof InputPort && outport instanceof OutputPort) {
            outport.attach(inp);
        }
    }
    //TODO InputPort currently uses the Node as the proxy to send output, but this implementation breaks that paradigm.
    out(inport, outport) {
        let outp = this.outport(outport);

        if(inport instanceof InputPort && outp instanceof OutputPort) {
            inport.attach(outp);
        }
    }
};