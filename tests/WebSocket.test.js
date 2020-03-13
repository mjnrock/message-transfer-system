import MTS from "./../src/package";

let ws = new MTS.WebSocketManager();

ws.subscribe(console.log);

ws.connect(`localhost:3000`);