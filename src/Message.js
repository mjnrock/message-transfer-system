import { v4 as uuidv4 } from "uuid";

export default class Message {
    constructor(type, payload, emitter, { id, timestamp } = {}) {
        this.id = id || uuidv4();
        this.type = type;
        this.payload = payload;
        this.timestamp = timestamp || Date.now();
        this.emitter = emitter;

        return Object.seal(this);
    }

    toJson() {
        return JSON.stringify(this);
    }
    toObject() {
        return JSON.parse(JSON.stringify(this));
    }

    static FromJson(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }

        return new Message(
            obj.type,
            obj.payload,
            obj.emitter,
            {
                id: obj.id,
                timestamp: obj.timestamp
            }
        );
    }

    static Conforms(obj) {
        if(obj instanceof Message) {
            return true;
        } else if(typeof obj !== "object") {
            return false;
        }

        return "id" in obj
            && "type" in obj
            && "payload" in obj
            && "timestamp" in obj
            && "emitter" in obj;
    }
    static JsonConforms(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }

        return Message.Conforms(obj);
    }
}