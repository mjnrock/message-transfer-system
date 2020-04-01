import MTSLib from "./../src/package";

const Main = new MTSLib.Main({
    name: "Main",
    receive: msg => MTSLib.MSRP(msg, Main)
        // .blacklist(Main)
        // .exclude(Main)
        // .if(Main)
        .if("Test", "Zebra")
            .run(() => console.log("THIS SHOULD RUN 1"), "test-1")
        .if("Cat")
        // .if(Main)
        //     .exclude(Main)
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
        // .debug()
});
// const Node1 = new MTSLib.Node();
const Node1 = new MTSLib.Node({
    name: "Node1",
    receive: console.log
});

Main.register(Node1);
// Main.Router.addRoute(Node1, true);

Main.send("Test", "Hello");
// Node1.send("Cat", "Hay");
// Node1.send("Zebra", "Moo");