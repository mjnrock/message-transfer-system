import { GenerateUUID } from "./util/helper";

export default class Message {
    // constructor(type, payload, { source = null, recipient = null, provenance = [], id = GenerateUUID() } = {}) {
    constructor(type, payload, { source = null, recipient = null, id = GenerateUUID() } = {}) {
        this.id = id;
        this.type = type;
        this.payload = payload;

        this.source = source;
        this.recipient = recipient;
        // this.provenance = provenance;

        this.timestamp = Date.now();

        return this;
    }

    // claim(signet) {
    //     this.provenance.push(Object.freeze({ id: signet, timestamp: Date.now(), action: "in" }));
    // }
    // release(signet) {
    //     this.provenance.push(Object.freeze({ id: signet, timestamp: Date.now(), action: "out" }));
    // }

    toJson() {
        return JSON.stringify(this);
    }

    static fromJson(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }
        
        return new Message(
            obj.type,
            obj.payload,
            {
                id: obj.id,
                source: obj.source,
                recipient: obj.recipient,
                // provenance: obj.provenance,
            }
        );
    }

    static conforms(obj, strict = false) {
        if(typeof obj === "object") {
            if(strict) {            
                return ("id" in obj)
                    && ("type" in obj)
                    && ("payload" in obj)
                    && ("source" in obj)
                    && ("recipient" in obj)
                    // && ("provenance" in obj)
                    && ("timestamp" in obj);
            }

            return ("id" in obj)
                && ("type" in obj)
                && ("payload" in obj)
                && ("timestamp" in obj);
        }

        return false;
    }
};