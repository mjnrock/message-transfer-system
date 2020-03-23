import MTSLib from "./../src/package";

const Main = new MTSLib.Main();
const Mgr1 = new MTSLib.Manager("Receiver", {
    receive: console.log
});

Main.setBroadcastType([
    MTSLib.Repeater.BroadcastType.MESSAGE,
    // MTSLib.Repeater.BroadcastType.SUBSCRIPTION,
]);
Main.setBroadcastType(MTSLib.Repeater.BroadcastType.SUBSCRIPTION);
console.log(Main.state);
// Mgr1.subscribeTo(Main);

// Main.Router.addRoute(Mgr1, true);
// Main.register(Mgr1);

// let id = Main.addMessage(MTSLib.Repeater.SignalType.TICK, Math.random(), 750);

// console.log(id);
// console.log(Main);