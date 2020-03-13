import { GenerateUUID } from "./helper";

export default class Event {
    constructor(type, payload, emitter = null) {
        this.uuid = GenerateUUID();
        this.type = type;
        this.payload = payload;
        this.emitter = emitter;
        this.timestamp = Date.now();

        return Object.freeze(this);
    }

    static conforms(e) {
        return ("uuid" in e)
            && ("type" in e)
            && ("payload" in e)
            && ("emitter" in e)
            && ("timestamp" in e);
    }

    getType() {
        return this.type;
    }
    isType(type) {
        return this.type === type;
    }

    getPayload(...indexes) {
        if(indexes.length && Array.isArray(this.payload)) {
            let arr = [];

            for(let index of indexes) {
                if(typeof index === "number") {
                    arr.push(this.payload[ index ]);
                }
            }

            if(indexes.length === 1) {
                return arr[ 0 ];
            } else {
                return arr;
            }
        }
        
        return this.payload;
    }

    getTimestamp() {
        return this.timestamp;
    }
    
    getEmitter() {
        return this.emitter;
    }
};