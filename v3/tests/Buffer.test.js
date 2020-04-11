import ByteBuffer from "./../util/ByteBuffer";
import Signal from "./../Signal";

let s = new Signal("Test", {
    cat: 2,
    names: [ "Kiszka", "Buddha" ]
});

console.log(s);
let buff = s.toBuffer();     // Using Signal methods
// let buff = ByteBuffer.WriteString(s.toJson());  // From static method
console.log(buff);

console.log(Signal.fromBuffer(buff));   // Using static Signal methods
// console.log(ByteBuffer.ReadString(buff));   // From static method

// let bb1 = new ByteBuffer(
//     ByteBuffer.TINY(3),
//     ByteBuffer.TINY()
// );

// bb1.writeTiny(15);
// bb1.writeTiny(3);
// bb1.writeTiny(46);
// bb1.writeBoolean([ true, true, true, false ]);

// bb1.resetPosition();

// console.log(bb1.Buffer);

// console.log(bb1.readTiny());
// console.log(bb1.readTiny());
// console.log(bb1.readTiny());
// console.log(bb1.readBoolean());


// let str = "Hello world!";
// console.log(ByteBuffer.UTF8Encode(str));
// let bb2 = new ByteBuffer(
//     ByteBuffer.STRING(str)
// );

// bb2.writeString(str);
// let buff = bb2.Buffer;
// bb2.resetPosition();

// let b = new ByteBuffer();
// b.setBuffer(buff);
// console.log(b.readString(5));