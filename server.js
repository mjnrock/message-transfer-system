import MTSLib from "./src/package";

const express = require("express");
const path = require("path");
const app = express();
const expressWs = require("express-ws")(app);
const port = 3000;

app.use(express.static(path.join(__dirname, "/public")));
app.set("trust proxy", true);

//  https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server

// console.log(expressWs.getWss());
// console.log(expressWs.getWss().clients);

const MTS = MTSLib.Modules.Network(new MTSLib.MasterNode({
    receive: msg => MTSLib.$.MRSP(msg)
        .if("GyroData")
        .debug()
}), { isMaster: true });
// MTS.addMessage(MTSLib.Network.WebSocketNode.SignalTypes.MESSAGE, new MTSLib.Message("Ping", "Pong", MTS.signet), 1000);

console.warn(`MTS: ${ MTS.id }`);

app.ws("/", function (ws, req) {
    let id = MTS.Network.webSocketNode({ ws });
    
    console.warn(`WS: ${ id }`);
});

app.listen(port, () => console.log(`Server listening on port ${ port }!`));