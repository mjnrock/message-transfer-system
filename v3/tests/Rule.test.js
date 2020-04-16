import Node from "./../Node";
import Proposition from "./../Proposition";
import Action from "./../Action";
import Rule from "./../Rule";

let N1 = new Node({
    name: "Node 1",
    receive: (msg, feed) => {
        let res = Rule.Process(msg)
            .if()
                .type("test")
                .payload()
                    .between(6, 30)
                .end()
            .then()
                .node(N2)
                .prop({
                    fish: 5
                })
                .run(console.log)
                .node(N1)
                .prop({
                    lasagna: 69
                })
                .run(console.log)
            .done()

        console.log(`[1]:`, res);
    }
});
let N2 = new Node({
    name: "Node 2",
    receive: (msg, signature) => console.log(`[1]:`, message, signature)
});

N1.listen(N2);

N2.emit("test", 15);