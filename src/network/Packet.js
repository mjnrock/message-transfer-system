import Message from "./../Message";

export default class Packet extends Message {
    constructor(payload, source, destination, { type = 0 } = {}) {
        super(type, payload, source);
        
        this.destination = destination;

        return this;
    }

    static fromJson(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }
        
        return new Packet(
            obj.payload,
            obj.source,
            obj.destination,
            {
                type: obj.type
            }
        );
    }

    static extractMessage(packet) {
        if(Packet.conforms(packet)) {
            let payload = packet.payload;

            if(Message.conforms(payload)) {
                return payload;
            }
        }

        return false;
    }

    static conforms(obj) {
        return ("type" in obj)
            && ("payload" in obj)
            && ("source" in obj)
            && ("destination" in obj)
            && ("timestamp" in obj);
    }
};