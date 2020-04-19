import Node from "../Node";
import Condition from "../_logic/Condition";
import Rule from "../_logic/Rule";

let RES = null;
let N1 = new Node({
    receive: (msg, signature) => {
        let res = Condition.Process(msg)
            .type("test")
            .payload("c.d.e")
                .between(2, 9)
            // .payload()
            //     .between(6, 100)
            // .value(({ p }) => p * 500)
            //     .lt(2000)
            .end()
            .getScope

        RES = Condition.Process(msg)
            .type("test")
            .payload("c.d.e")
                .between(2, 9)
            // .payload()
            //     .between(6, 10)
            // .value(({ p }) => p * 500)
            //     .lt(2000)
            .end()
        .package
    }
});
let N2 = new Node({
    receive: msg => Rule.Process
});

N1.listen(N2);

N2.emit("test", 50);
N2.emit("test", {
    a: 1,
    b: 2,
    c: {
        d: {
            e: 5
        }
    }
});
// N1.emit("hi", 1);

RES({
    type: 'test',
    shape: 's0',
    payload: {
        a: 1,
        b: 2,
        c: {
            d: {
                e: 50
            }
        }
    },
    source: '13d0c5a8-d053-4283-824b-2c00a78981e0',
    destination: undefined,
    timestamp: 1587050671226
})