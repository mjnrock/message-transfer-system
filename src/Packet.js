import Message from "./Message";

export default class Packet extends Message {
    constructor(type, payload, source, destination) {
        super(type, payload, source);
        
        this.destination = destination;

        return Object.freeze(this);
    }

    static fromJSON(json) {
        let obj = json;

        while(typeof obj === "string" || obj instanceof String) {
            obj = JSON.parse(obj);
        }
        
        return new Packet(
            obj.type,
            obj.payload,
            obj.source,
            obj.destination
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