import ByteBuffer from "./util/ByteBuffer";

export default class Message {
    constructor(type, payload, { shape = "s0", timestamp = Date.now() } = {}) {
        try {        
            let data = JSON.stringify(payload);
            
            this.ByteBuffer = new ByteBuffer(
                ByteBuffer.TINY(),
                ByteBuffer.STRING(type.toString()),

                ByteBuffer.TINY(),
                ByteBuffer.STRING(shape.toString()),

                ByteBuffer.TINY(),
                ByteBuffer.STRING(timestamp.toString()),

                ByteBuffer.STRING(data),
            );

            bb.writeTiny(type.length);          //  The Signal type, used for conditional work
            bb.writeString(type.toString());

            bb.writeTiny(shape.length);         //  The payload data shape, describing its conformation
            bb.writeString(shape.toString());

            bb.writeTiny(timestamp.toString().length);  //  The actual data of the Signal
            bb.writeString(timestamp.toString());

            bb.writeString(data);
        } catch(e) {
            return false;
        }
    }

    get size() {
        return this.ByteBuffer.size;
    }
    
    get buffer() {
        return this.ByteBuffer.Buffer;
    }

    get type() {
        try {
            this.ByteBuffer.reset();

            return this.ByteBuffer.readString(this.ByteBuffer.readTiny());
        } catch(e) {
            return false;
        }
    }
    get shape() {
        try {
            this.type;
            
            return this.ByteBuffer.readString(this.ByteBuffer.readTiny());
        } catch(e) {
            return false;
        }
    }
    get timestamp() {
        try {
            this.timestamp;
            
            return this.ByteBuffer.readString(this.ByteBuffer.readTiny());
        } catch(e) {
            return false;
        }
    }
    get payload() {
        try {
            this.timestamp;
            
            return this.ByteBuffer.readString(this.ByteBuffer.size - this.ByteBuffer.position);
        } catch(e) {
            return false;
        }
    }

    toObject() {
        return {
            type: this.type,
            shape: this.shape,
            payload: this.payload,
            timestamp: this.timestamp
        };
    }
    toJson() {
        return JSON.stringify(this.toObject());
    }
};