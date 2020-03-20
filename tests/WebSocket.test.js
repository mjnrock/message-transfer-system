import MTSLib from "./../src/package";

const MTS = new MTSLib.Main();

let ws = new MTSLib.Network.WebSocketManager();
MTS.register(ws);
// MTS.Router.addRoute(ws, [ MTSLib.Network.WebSocketManager.SignalTypes.CLIENT_ID ]); //? .register(WebSocketManager) auto-hooks the routes

// ws.subscribe(console.log);
ws.start({ uri: `localhost:3000` });


let mgr = new MTSLib.Manager("test");
MTS.register(mgr);

setTimeout(() => {
    // mgr.message(MTSLib.Network.WebSocketManager.Wrap(new MTSLib.Message("AAAA", "VVVVV", "CCCC")));
    ws.wssend("ABCD", 123456789);
    // ws.wsmessage(new MTSLib.Message("AAAA", "VVVVV", "CCCC"));
}, 1000);