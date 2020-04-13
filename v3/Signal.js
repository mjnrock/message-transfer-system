import ByteBuffer from "./util/ByteBuffer";

export default class Signal {
    constructor(payload) {
        try {
            if(payload instanceof ArrayBuffer) {
                this.ByteBuffer = new ByteBuffer(payload);
            } else {
                let data = JSON.stringify(payload);
                
                this.ByteBuffer = new ByteBuffer(
                    ByteBuffer.STRING(data),
                );
    
                bb.writeString(data);
            }
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

    get data() {
        try {
            this.ByteBuffer.reset();
            
            return JSON.parse(this.ByteBuffer.readString(this.ByteBuffer.size));
        } catch(e) {
            return false;
        }
    }

    get json() {
        try {
            this.ByteBuffer.reset();
            
            return this.ByteBuffer.readString(this.ByteBuffer.size);
        } catch(e) {
            return false;
        }
    }
};