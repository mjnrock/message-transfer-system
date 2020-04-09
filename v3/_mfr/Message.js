import { GenerateUUID } from "../util/helper";
import Signal from "../Signal";

export default class Message extends Signal {
    constructor(type, payload, { shape = "s0", source = null, recipient = null, id = GenerateUUID() } = {}) {
        super(type, payload, { shape });

        this.id = id;                   //  A unique identifier for the Message
        this.source = source;           //  The generating source of the Message
        this.recipient = recipient;     //  The generating source of the Message

        this.timestamp = Date.now();

        return this;
    }

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
                shape: obj.shape,
                source: obj.source,
                recipient: obj.recipient,
                id: obj.id,
            }
        );
    }

    static conforms(obj) {
        if(typeof obj === "object") {
            return ("id" in obj)
                && ("source" in obj)
                && ("recipient" in obj)
                // Signal properties
                && ("type" in obj)
                && ("shape" in obj)
                && ("payload" in obj)
                && ("timestamp" in obj);
        }

        return false;
    }
};