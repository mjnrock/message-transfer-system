import MTSLib from "./../src/package";

const MTS = new MTSLib.Main();

let ws = new MTSLib.Network.WebSocketManager();
MTS.register(ws);
MTS.Router.addRoute(ws, [ MTSLib.Network.WebSocketManager.MessageTypes.CLIENT_ID ]);

// ws.subscribe(console.log);
ws.start({ uri: `localhost:3000` });