import MTS from "./../src/package";

let ws = new MTS.WebSocketClient();

ws.send = ws.receive;   //! Debugging simplification
ws.subscribe(console.log);

ws.connect(`localhost:3000`);