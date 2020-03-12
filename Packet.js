import Message from "./Message";

export default class Packet extends Message {
    static Types = {
        DEFAULT: 1,
        WEBSOCKET: 2,
    };

    constructor(type, payload, destination, source, protocol = Packet.Types.DEFAULT) {
        super(type, payload, destination, source);
        
        this.protocol = protocol;

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
        
        return new Packet(
            obj.type,
            obj.payload,
            obj.destination,
            obj.source,
            obj.protocol
        );
    }

    static conforms(obj) {
        return Message.conforms(obj)
            && ("protocol" in obj);
    }

    static fromMessage(msg, protocol) {
        if(msg instanceof Message) {            
            return new Packet(
                msg.type,
                msg.payload,
                msg.destination,
                msg.source,
                protocol
            );
        }
    }
};