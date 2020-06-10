import Node from "./../Node";
import Condition from "./../Condition";
import Action from "./../Action";
import Rule from "./../Rule";

let N1 = new Node({
    name: "Node 1",
    receive: (signal, feed) => {
        console.time();
        Rule.Process(signal, { node: N1 })
            .if
                .type("test")
                .payload()
                    .between(6, 30)
                .end()
                .then
                    .node(N2)
                    .prop({
                        fish: 5
                    })
                    .node(N1)
                    .prop({
                        lasagna: 69
                    })
            .elseif
                .type("test2")
                .then
                    .node(N1)
                    .prop({
                        cats: 4
                    })
            .done
        console.timeEnd();

        // let res2 = Rule.Process(signal)
        //     .if()
        //         .type("test2")
        //     .then()
        //         .node(N1)
        //         .prop({
        //             cats: 19
        //         })
        //         .run(console.log)
        //     .done()
        // console.log(`[1]:`, res2);
    }
});
let N2 = new Node({
    name: "Node 2",
    receive: (signal, feed) => console.log(`[1]:`, signal, feed)
});

N1.listen(N2);

N2.emit("test", 15);
N2.emit("test", 14);
N2.emit("test2", 9);
N2.emit("test2", 8);

console.log(N1.state);
console.log(N2.state);