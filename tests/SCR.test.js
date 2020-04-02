import StateChangeSequencer from "./../src/StateChangeSequencer";
import StateChangeSequencerFactory from "./../src/StateChangeSequencerFactory";

let message = {
    key: "bob.cat",
    current: 10,
    previous: 5
};

let res = StateChangeSequencerFactory.Process(message, "and")
.current()
    .or()
        .gt(1)
        .lt(52)
        .and()
            .gt(5)
            .lt(45)
        .end()
    .end()
    .or()
        .gt(5)
        .lt(90)
        .and()
            .gt(7)
            .lt(45)
            .and()
                .gt(3)
                .lt(45)
            .end()
        .end()
        .equals(10)
    .end()
.key()
    .begin()
        .regex(/\./gi)
    .end()
.done()

console.log(res);

let test = eval(res);
console.log(test(message));