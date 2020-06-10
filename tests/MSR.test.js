import MTSLib from "./../src/package";

const Main = new MTSLib.Main({
    name: "Main",
    receive: msg => MTSLib.$.MSRP(msg, {
        scope: Main
    })
        .if("Test", "Zebra")
            .run(msg => console.log(msg))
            .send("Cat", "Hay")
        .if("Cat")
            .run(msg => console.log(msg))
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
// Main.send("Cat", "Hay");
// Node1.send("Zebra", "Moo");