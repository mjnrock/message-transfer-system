export default class ByteBuffer {
	constructor() {
		let size = 0;
		if(arguments.length > 1) {
            size = [ ...arguments ].reduce((acc, v) => acc + v);
		} else if(arguments.length === 1) {
			size = arguments[ 0 ];
		}

		this.Buffer = new ArrayBuffer(size);
        this.DV = new DataView(this.Buffer);
        
		this._position = 0;
		this._isLittleEndian = false;
	}

	getEndianness() {
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

	getPosition() {
		return this._position;
	}
	setPosition(position) {
		this._position = position;

		return this;
	}
	addPosition(value) {
		this._position += value || 1;

		return this;
	}
	resetPosition() {
		this._position = 0;

		return this;
	}

	getBuffer() {
		return this.Buffer;
	}
	setBuffer(buffer) {
		this.Buffer = buffer;
		this.resetPosition();
		this.DV = new DataView(this.Buffer);

		return this;
	}
	newBuffer(size) {
		this.Buffer = new ArrayBuffer(size);
		this.resetPosition();
		this.DV = new DataView(this.Buffer);
	}

	write(dt, value) {
		let bytes = ByteBuffer.ResolveBytes(dt);
		if (value instanceof Array) {
			for (let i in value) {
				this.DV["set" + dt](
					this._position,
					value[i],
					this._isLittleEndian
				);
				this.addPosition(bytes);
			}
		} else {
			this.DV["set" + dt](this._position, value, this._isLittleEndian);
			this.addPosition(bytes);
		}

		return this;
	}
	read(dt, al) {
		let bytes = ByteBuffer.ResolveBytes(dt);
		if (al > 0) {
			let array = [];
			for (let i = 0; i < al; i++) {
				array.push(
					this.DV["get" + dt](this._position, this._isLittleEndian)
				);
				this.addPosition(bytes);
			}

			return array;
		} else {
			let value = this.DV["get" + dt](this._position, this._isLittleEndian);
			this.addPosition(bytes);

			return value;
		}
	}

	writeString(value) {
		for (let i in value) {
			//  Simple ASCII encoding, translating to UTF8 (UInt8 Array)
			this.DV.setUint8(this._position, value.charCodeAt(i));
			this.addPosition(1);
		}

		return this;
	}
	readString(characters) {
		let array = [];
		for (let i = 0; i < characters; i++) {
			//  Simple ASCII decoding, translating to UTF8 (UInt8 Array)
			array.push(String.fromCharCode(this.DV.getUint8(this._position)));
			this.addPosition(1);
		}

		return array.join("");
	}

	writeUUID(uuid) {
		return this.writeString(uuid);
	}
	readUUID() {
		return this.readString(36);
	}

	writeBoolean(value) {
		if (value instanceof Array) {
			for (let i in value) {
				value[i] = !!value[i] ? 1 : 0;
			}
		}

		return this.write("Uint8", value);
	}
	readBoolean(arrayLength) {
		return this.read("Uint8", arrayLength);
	}

	writeTiny(value, isSigned = true) {
		return this.write(isSigned ? "Int8" : "Uint8", value);
	}
	readTiny(arrayLength, isSigned = true) {
		return this.read(isSigned ? "Int8" : "Uint8", arrayLength);
	}
	writeShort(value, isSigned = true) {
		return this.write(isSigned ? "Int16" : "Uint16", value);
	}
	readShort(arrayLength, isSigned = true) {
		return this.read(isSigned ? "Int16" : "Uint16", arrayLength);
	}
	writeInt(value, isSigned = true) {
		return this.write(isSigned ? "Int32" : "Uint32", value);
	}
	readInt(arrayLength, isSigned = true) {
		return this.read(isSigned ? "Int32" : "Uint32", arrayLength);
	}

	//  @TODO:  Int64 is not a function.  Either encode into Int32 or use Float64
	writeLong(value, isSigned = true) {
		return this.write(isSigned ? "Int64" : "Uint64", value);
	}
	readLong(arrayLength, isSigned = true) {
		return this.read(isSigned ? "Int64" : "Uint64", arrayLength);
	}

	writeFloat(value) {
		return this.write("Float32", value);
	}
	readFloat(arrayLength) {
		return this.read("Float32", arrayLength);
	}
	writeDouble(value) {
		return this.write("Float64", value);
	}
	readDouble(arrayLength) {
		return this.read("Float64", arrayLength);
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
	static UUID(quantity, includeHyphens = true) {
		return (includeHyphens ? 36 : 32) * (quantity || 1);
	}
	static TINY(quantity = 1) {
		return 1 * quantity;
	}
	static SMALL(quantity = 1) {
		return 2 * quantity;
	}
	static INT(quantity = 1) {
		return 4 * quantity;
	}
	static LONG(quantity = 1) {
		return 8 * quantity;
	}

	static FLOAT(quantity = 1) {
		return 4 * quantity;
	}
	static DOUBLE(quantity = 1) {
		return 8 * quantity;
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