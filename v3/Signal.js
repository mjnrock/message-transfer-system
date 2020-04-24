import ByteBuffer from "./util/ByteBuffer";

export default class Signal {
    constructor(type, payload, { shape = "s0", timestamp = Date.now(), source, destination } = {}) {
        this.type = type;           //  The Signal type, used for conditional work
        this.shape = shape;         //  The payload data shape, describing its conformation
        this.payload = payload;     //  The actual data of the Signal

        this.source = source;
        this.destination = destination;

        this.timestamp = timestamp;

        //  Immutability by <Proxy>
        return new Proxy(this, {
            get: function(target, key){
                return target[ key ];
            },

            setProperty: function(target, key, value) {
                //? Addable properties, but not modifiable
                if(!target.hasOwnProperty(key)) {
                    target[ key ] = value;
                }

                return true;
            },
            set: function(target, key, value){
                return this.setProperty(target, key, value);
            },

            // defineProperty: function (target, key) {
            //     return this.setProperty(target, key, value);
            // },

            deleteProperty: function(target, key) {
                return false;
            }
        });
        // return this;
    }

    toJson() {
        return JSON.stringify(this);
    }

    /**
     * This will create a simplified buffer using TINYs as flag lengths for each input.  The schema is as follows:
     * @typeLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @type [ value of @typeLength in bytes ] This is the actual @type data
     * @shapeLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @shape [ value of @shapeLength in bytes ] This is the actual @shape data
     * @timestampLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @timestamp [ value of @timestampLength in bytes ] This is the actual @timestamp data
     * @payload [ the remainder of the buffer ] Put last so the payload can be as large as needed
     *  ! CAVEAT: @payload will undergo a `JSON.stringify` before being put into the buffer, as it is assumed to be an object
     */
    toBuffer() {
        let payload = JSON.stringify(this.payload);
        let bb = new ByteBuffer(
            ByteBuffer.TINY(),
            ByteBuffer.STRING(this.type.toString()),

            ByteBuffer.TINY(),
            ByteBuffer.STRING(this.shape.toString()),

            ByteBuffer.TINY(),
            ByteBuffer.STRING(this.timestamp.toString()),

            ByteBuffer.TINY(),
            ByteBuffer.STRING(this.source.toString()),

            ByteBuffer.TINY(),
            ByteBuffer.STRING(this.destination.toString()),

            ByteBuffer.STRING(payload),
        );

        bb.writeTiny(this.type.length);
        bb.writeString(this.type.toString());

        bb.writeTiny(this.shape.length);
        bb.writeString(this.shape.toString());

        bb.writeTiny(this.source.length);
        bb.writeString(this.source.toString());

        bb.writeTiny(this.destination.length);
        bb.writeString(this.destination.toString());

        bb.writeTiny(this.timestamp.toString().length);
        bb.writeString(this.timestamp.toString());

        bb.writeString(payload);

        return bb.Buffer;
    }
    /**
     * This will create a buffer from `this.toJson()`
     */
    toJsonBuffer() {
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

                source: obj.source,
                destination: obj.destination,
            }
        );
    }

    /**
     * This will extract a Signal buffer and return a new Signal, leveraging `Signal.FromJson`
     * @typeLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @type [ value of @typeLength in bytes ] This is the actual @type data
     * @shapeLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @shape [ value of @shapeLength in bytes ] This is the actual @shape data
     * @timestampLength [ 1 byte ] This describes how many bytes to read, capped at 255, as it uses UINT8
     * @timestamp [ value of @timestampLength in bytes ] This is the actual @timestamp data
     * @payload [ the remainder of the buffer ] Calculated by taking the buffer length and subtracting the current position (at this point in the read)
     *  ! CAVEAT: Because this assumes that the `Signal.toSignalBuffer` method was used, @payload will undergo a `JSON.parse()` before being returned
     */
    static FromBuffer(buffer) {
        let bb = new ByteBuffer(buffer);
        
        let obj = {
            typeLen: null,
            type: null,
            
            shapeLen: null,
            shape: null,
            
            sourceLen: null,
            source: null,
            
            destinationLen: null,
            destination: null,

            timestampLen: null,
            timestamp: null,

            payload: null,
        };

        obj.typeLen = bb.readTiny();
        obj.type = bb.readString(obj.typeLen);

        obj.shapeLen = bb.readTiny();
        obj.shape = bb.readString(obj.shapeLen);

        obj.sourceLen = bb.readTiny();
        obj.source = bb.readString(obj.sourceLen);

        obj.destinationLen = bb.readTiny();
        obj.destination = bb.readString(obj.destinationLen);

        obj.timestampLen = bb.readTiny();
        obj.timestamp = parseFloat(bb.readString(obj.timestampLen));

        obj.payload = bb.readString(bb.size - bb.position);

        try {
            obj.payload = JSON.parse(obj.payload);
        } catch (e) {}

        return Signal.FromJson(obj);
    }

    static FromJsonBuffer(buffer) {
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