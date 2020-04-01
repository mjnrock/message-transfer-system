import MTSLib from "./../src/package";

const Main = new MTSLib.Main({
    receive: msg => {
        let msr = MTSLib.MSRP(msg, {
            scope: Main
        })
            .if("Test")
            .run(() => console.log("THIS SHOULD RUN 1"), "test-1")
            .or(true, () => true, () => false)
            .run(() => console.log("THIS SHOULD RUN 2"), "test-2")
            .and(true, () => true, () => true)
            // .run(() => console.log("THIS SHOULD RUN 3"), "test-3")
            // .and(true, () => true, () => false)
            // .run(() => console.log("THIS SHOULD NOT RUN 4"), "test-4")
            // .repair()
            // .and(true, () => true, () => true)
            // .run(() => console.log("THIS SHOULD RUN 5"), "test-5")
            .state({
                gatti: "Kiszkas and Buddhies"
            })
            .prop({
                cat: "Kiszka"
            })
            // .getResults("test-2")
            .getState()
            // .send("Cats", "K & B")

        console.log(msr);
        // console.log(Main.state);
    }
});
const Node1 = new MTSLib.Node();
// const Node1 = new MTSLib.Node({
//     receive: console.log
// });

Main.register(Node1);
// Main.Router.addRoute(Node1, true);

Node1.send("Test", "Hello");