import { GenerateUUID } from "./util/helper";
import Node from "./Node";

export default class Channel {
    constructor(topic, shape, { members = {} } = {}) {
        this.id = GenerateUUID();
        
        this._topic = topic || [];
        this._shape = shape || [];
        this._members = members || {};
    }

    get signet() {
        return `${ this.id }`;
    }
    get constraints() {
        return {
            topic: this._topic,
            shape: this._shape
        };
    }
    get members() {
        return this._members;
    }

    join(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                this._members[ node.id ] = node;
            }
        }
    }
    leave(...nodes) {
        for(let node of nodes) {
            delete this._members[ node.id ];
        }
    }

    relay(payload, meta = {}) {
        for(let member of Object.values(this.members)) {
            member.receive(payload, meta, this);
        }
    }
};