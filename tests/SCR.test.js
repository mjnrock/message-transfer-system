import Rule from "../src/Rule";
import RuleFactory from "./../src/RuleFactory";
import Node from "../src/Node";

let message = {
    type: Node.SignalTypes.STATE_CHANGE,
    payload: {
        key: "bob.cat",
        current: 10,
        previous: 5
    },
    source: null
};

let res = RuleFactory.Process(message, "and")
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

let res2 = Rule.Process(message, "and")
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

let test = eval(res);
console.log(test(message))

console.log(res2)


let res3 = Rule.Process(message, "or")
    .value(15)
        .equals(15)
        .lt(4)
    .done()

console.log(res3)