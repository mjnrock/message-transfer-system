import MTSLib from "./../src/package";

const Main = new MTSLib.Main();
const Node1 = new MTSLib.Node("Receiver", {
    receive: console.log
});

Main.setBroadcastType([
    MTSLib.Repeater.BroadcastType.MESSAGE,
    // MTSLib.Repeater.BroadcastType.SUBSCRIPTION,
]);
Main.setBroadcastType(MTSLib.Repeater.BroadcastType.SUBSCRIPTION);
console.log(Main.state);
// Node1.subscribeTo(Main);

// Main.Router.addRoute(Node1, true);
// Main.register(Node1);

// let id = Main.addMessage(MTSLib.Repeater.SignalType.TICK, Math.random(), 750);

// console.log(id);
// console.log(Main);