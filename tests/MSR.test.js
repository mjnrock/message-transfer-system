import MTSLib from "./../src/package";

const Main = new MTSLib.Main({
    receive: msg => MTSLib.MSRP(msg, Main)
        .if("Test", "Zebra")
            .run(() => console.log("THIS SHOULD RUN 1"), "test-1")
        .if("Cat")
            .run(() => console.log("THIS SHOULD RUN 3"), "test-3")
            .run(() => console.log("THIS SHOULD RUN 4"), "test-4")
            .or(true, () => true, () => false)
            .run(() => console.log("THIS SHOULD RUN 2"), "test-2")
            .or(false, true)
            .run(() => console.log("THIS SHOULD RUN 999"), "test-999")
            .state({
                gatti: "Kiszkas and Buddhies"
            }, false)
            .prop({
                cat: "Kiszka"
            }, false)
        .debug()
});
const Node1 = new MTSLib.Node();
// const Node1 = new MTSLib.Node({
//     receive: console.log
// });

Main.register(Node1);
// Main.Router.addRoute(Node1, true);

// Node1.send("Test", "Hello");
Node1.send("Cat", "Hay");
// Node1.send("Zebra", "Moo");