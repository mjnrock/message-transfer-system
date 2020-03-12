export default class Message {
    constructor(type, payload, destination, source = null) {
        this.type = type;
        this.payload = payload;
        this.destination = destination;
        this.source = source;
        this.timestamp = Date.now();

        return Object.freeze(this);
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
            obj.destination,
            obj.source
        );
    }

    static conforms(obj) {
        return ("type" in obj)
            && ("payload" in obj)
            && ("destination" in obj)
            && ("source" in obj)
            && ("timestamp" in obj);
    }
};