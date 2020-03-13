export default class Message {
    constructor(type, payload, source, destination = null) {
        this.type = type;
        this.payload = payload;
        this.source = source;
        this.destination = destination;
        this.timestamp = Date.now();

        return Object.freeze(this);
    }

    //! If this causes a circular issue, rename it to "toJson" | I don't know if the custom toJSON will cause circularity in JSON.stringify()
    toJSON() {
        return JSON.stringify(this);
    }

    static fromJSON(json) {
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