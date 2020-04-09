export default class Signal {
    constructor(type, payload, { shape = "s0" } = {}) {
        this.type = type;           //  The Signal type, used for conditional work
        this.shape = shape;         //  The payload data shape, describing its conformation
        this.payload = payload;     //  The actual data of the Signal

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
        
        return new Signal(
            obj.type,
            obj.payload,
            {
                shape: obj.shape,
            }
        );
    }

    static conforms(obj) {
        if(typeof obj === "object") {
            return ("type" in obj)
                && ("shape" in obj)
                && ("payload" in obj)
                && ("timestamp" in obj);
        }

        return false;
    }
};