export default class Message {
    constructor(type, payload, source) {
        this.type = type;
        this.payload = payload;
        this.source = source;
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
            obj.source
        );
    }

    static conforms(obj) {
        return ("type" in obj)
            && ("payload" in obj)
            && ("source" in obj)
            && ("timestamp" in obj);
    }
};