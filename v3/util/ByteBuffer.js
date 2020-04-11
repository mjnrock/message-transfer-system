export default class ByteBuffer {
    static IsLittleEndian = (function () {
        let buffer = new ArrayBuffer(2);
        
        new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
    
        // Int16Array uses the platform's endianness.
        return new Int16Array(buffer)[0] === 256;
    })();

    constructor(...inputs) {
        let size = 0;
        if(inputs.length > 1) {
            size = inputs.reduce((a, v) => a + v);
        } else if(inputs.length === 1) {
            size = inputs[ 0 ];
        }

        this._Buffer = new ArrayBuffer(size);
        this.DV = new DataView(this._Buffer);
        
		this._position = 0;
		this._isLittleEndian = false;
    }

    get size() {
        return this._Buffer.byteLength;
    }

	isLittleEndian() {
		return this._isLittleEndian;
	}
	toggleBigEndian() {
		this._isLittleEndian = false;

		return this;
	}
	toggleLittleEndian() {
		this._isLittleEndian = true;

		return this;
	}

    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }

    forward(bytes = 1) {
        this._position += bytes;

        this._position = Math.min(this._position, this.size);

        return this;
    }
    backward(bytes = 1) {
        this._position -= bytes;

        this._position = Math.max(this._position, 0);

        return this;
    }
    reset() {
        this._position = 0;

        return this;
    }

    get Buffer() {
        return this._Buffer;
    }
    set Buffer(buff) {
        if(buff instanceof ArrayBuffer) {
            this._Buffer = buff;
            this.reset();
            this.DV = new DataView(this._Buffer);
        }
    }
    newBuffer(size) {
        this._Buffer = new ArrayBuffer(size);
        this.reset();
        this.DV = new DataView(this._Buffer);

        return this;
    }

    read(dt, qty = 1) {
        let bytes = ByteBuffer.ResolveBytes(dt);
        
        if(qty === 1) {
            let value = this.DV[ `get${ dt }` ](this._position, this._isLittleEndian);            
            this.forward(bytes);

            return value;
        } else if(qty > 1) {
            let arr = [];

            for(let i = 0; i < qty; i++) {
                arr.push(this.DV[ `get${ dt }` ](this._position, this._isLittleEndian));
                this.forward(bytes);
            }
    
            return arr;
        }
    }
    write(dt, value) {
        let bytes = ByteBuffer.ResolveBytes(dt);
        
        this.DV[ `set${ dt }` ](this._position, value, this._isLittleEndian);
        this.forward(bytes);

		return this;
    }

	writeTiny(value, isSigned = true) {
		return this.write(isSigned ? "Int8" : "Uint8", value);
	}
	readTiny(qty = 1, isSigned = true) {
		return this.read(isSigned ? "Int8" : "Uint8", qty);
	}
	writeShort(value, isSigned = true) {
		return this.write(isSigned ? "Int16" : "Uint16", value);
	}
	readShort(qty = 1, isSigned = true) {
		return this.read(isSigned ? "Int16" : "Uint16", qty);
	}
	writeInt(value, isSigned = true) {
		return this.write(isSigned ? "Int32" : "Uint32", value);
	}
	readInt(qty = 1, isSigned = true) {
		return this.read(isSigned ? "Int32" : "Uint32", qty);
    }
    
	writeFloat(value) {
		return this.write("Float32", value);
	}
	readFloat(qty = 1) {
		return this.read("Float32", qty);
	}
	writeFloat64(value) {
		return this.write("Float64", value);
	}
	readFloat64(qty = 1) {
		return this.read("Float64", qty);
	}

	writeString(input) {
		for (let i in input) {
			//  Simple ASCII encoding, translating to UTF8 (UInt8 Array)
			this.DV.setUint8(this._position, input.charCodeAt(i));
			this.forward(1);
		}

		return this;
	}
	readString(length) {
		let str = "";
		for (let i = 0; i < length; i++) {
			//  Simple ASCII decoding, translating to UTF8 (UInt8 Array)
			str += String.fromCharCode(this.DV.getUint8(this._position));
			this.forward(1);
		}

		return str;
    }
    
	static WriteString(string) {
        let buffer = new ArrayBuffer(string.length),
            dv = new DataView(buffer);

        for(let i = 0; i < buffer.byteLength; i++) {
            //  Simple ASCII encoding, translating to UTF8 (UInt8 Array)
            dv.setUint8(i, string.charCodeAt(i));
        }

        return dv.buffer;
	}
	static ReadString(buffer, { offset = 0, length = buffer.byteLength } = {}) {
        let str = "",
            dv = new DataView(buffer);

		for(let i = 0; i < length; i++) {
			//  Simple ASCII decoding, translating to UTF8 (UInt8 Array)
            str += String.fromCharCode(dv.getUint8(offset + i));
		}

		return str;
    }

	static ResolveBits(dt) {
		return dt.toString().replace(/\D/g, "") * 8;
	}
	static ResolveBytes(dt) {
		return dt.toString().replace(/\D/g, "") / 8;
    }
    
	static STRING(text) {
		return text.length;
	}
	static UUID(qty, includeHyphens = true) {
		return (includeHyphens ? 36 : 32) * (qty || 1);
	}
	static TINY(qty = 1) {
		return 1 * qty;
	}
	static SMALL(qty = 1) {
		return 2 * qty;
	}
	static INT(qty = 1) {
		return 4 * qty;
	}
	static LONG(qty = 1) {
		return 8 * qty;
	}

	static FLOAT(qty = 1) {
		return 4 * qty;
	}
	static DOUBLE(qty = 1) {
		return 8 * qty;
	}

	static UTF8Encode(string) {        
        let arr = string.split("").map(c => c.charCodeAt(0));

		return arr;
	}
	static UTF8Decode(array) {
		let str = "";
		array.forEach(n => {
            str += String.fromCharCode(+n);
        });

		return str;
	}
}