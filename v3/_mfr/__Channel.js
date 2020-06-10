import { GenerateUUID } from "../util/helper";
import Node from "../Node";
import Message from "../Message";
import Topic from "./Topic";

export default class Channel {
    constructor(source, { name = null, topic = null, listeners = {} } = {}) {
        this.id = GenerateUUID();
        this.name = name || GenerateUUID();

        if(!(source instanceof Node)) {
            throw new Error(`[REQUIRED]: [@source] must be a <Node>`);
        }

        this._source = source;
        this._topic = topic || new Topic();
        this._listeners = listeners || {};
    }

    get signet() {
        return `${ this.name }<${ this.id }>`;
    }
    
    get topic() {
        return this._topic;
    }
    set topic(topic) {
        if(topic instanceof Topic) {
            this._topic = topic;
        }
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
        let msg;
            
        if(Message.conforms(type)) {
            msg = type;
        } else {
            msg = new Message(type, payload, { shape, source: this._source.signet });
        }

        if(this.topic.isOnTopic(msg)) {
            for(let subscriber of Object.values(this._listeners)) {
                if(subscriber instanceof Node) {
                    subscriber.receive(msg, {
                        name: this.name,    // At a root level Feed, this will be the Node's signet
                        signet: this.signet
                    });
                } else if(typeof subscriber === "function") {
                    subscriber(msg, {
                        name: this.name,    // At a root level Feed, this will be the Node's signet
                        signet: this.signet
                    });
                }
            }
        }
    }
};