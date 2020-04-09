import Node from "../Node";
import Proposition from "./../Proposition";

let N1 = new Node({
    receive: (signal, signature) => {
        // console.log(`[1]:`, signal, signature);

        let res = Proposition.Process(signal)
            .type("test")
            .payload("c.d.e")
                .between(2, 9)
            // .payload()
            //     .between(6, 100)
            // .value(({ p }) => p * 500)
            //     .lt(2000)
            .end()
            .done()

        console.log(`[1]:`, res);
    }
});
let N2 = new Node({
    receive: (signal, signature) => console.log(`[1]:`, signal, signature)
});

N1.listen(N2);

N2.emit("test", 105);
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