import ByteBuffer from "./util/ByteBuffer";

export default class Signal {
    constructor(type, payload, { shape = "s0", timestamp = Date.now() } = {}) {
        this.type = type;           //  The Signal type, used for conditional work
        this.shape = shape;         //  The payload data shape, describing its conformation
        this.payload = payload;     //  The actual data of the Signal

        this.timestamp = timestamp;

        return this;
    }

    toJson() {
        return JSON.stringify(this);
    }
    toBuffer() {
        return ByteBuffer.WriteString(this.toJson());
    }

    static FromJson(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }
        
        return new Signal(
            obj.type,
            obj.payload,
            {
                shape: obj.shape,
                timestamp: obj.timestamp,
            }
        );
    }

    static FromBuffer(buffer) {
        let json = ByteBuffer.ReadString(buffer);

        return Signal.FromJson(json);
    }

    static Conforms(obj) {
        if(typeof obj === "object") {
            return ("type" in obj)
                && ("shape" in obj)
                && ("payload" in obj)
                && ("timestamp" in obj);
        }

        return false;
    }
};