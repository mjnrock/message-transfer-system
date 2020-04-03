import { GenerateUUID } from "./helper";
import Node from "./Node";

export default class StructNode extends Node {
// export default class StructNode extends StateNode {
    static SignalType = {};
    
    static AllSignalTypes(...filter) {
        return Object.values(StructNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, mnode = null, packager = null } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            mnode: mnode,
            packager: packager
        });
    }

    //! Using `this.state` will invoke the Node emission functionality.
    //TODO Figure out best way to deal with this Node, in general
    setState(state = {}) {
        this._state = state;

        return this;
    }
    getState() {
        return this._state;
    }
};