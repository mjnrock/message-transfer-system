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

const MTS = (new MTSLib.Main()).loadNetwork(true);
MTS.addMessage(MTSLib.Network.WebSocketNode.SignalTypes.MESSAGE, new MTSLib.Message("Ping", "Pong", MTS.signet), 1000);

//TODO There is presently no cleanup for disconnected clients, like AT ALL
app.ws("/", function (ws, req) {
    let id = MTS.Network.createWebSocket({ ws });

    // MTS.Router.addRoute(MTS.Network.getWebSocket(), "Ping");
    MTS.Router.addRoute(MTS.Network.getWebSocket(id), MTSLib.Network.WebSocketNode.AllSignalTypes());

    console.log(MTS.Network.getWsAddressMap(false));
    //* Example cleanup poblem: occurred after client refreshed page (i.e. old idea still registered, but WS now absent)
    // {
    //     undefined: { id: 'fb2e20b0-24ee-4123-a9ab-c6fcd583dea8' },
    //     '::ffff:127.0.0.1': {
    //         id: '1fc3d3c6-cf78-4103-b1a8-9723603c7517',
    //         address: '::ffff:127.0.0.1',
    //         family: 'IPv6',
    //         port: 3000
    //     }
    // }
});

// //!DEBUGGING
// setTimeout(() => {
//     let id1 = MTS.Network.getWebSocket(0).id;
//     let id2 = MTS.Network.getWebSocket(1).id;

//     console.log(id1);
//     console.log(id2);
    
//     let msg = (new MTSLib.Message("ReplyAAAA", "Oi!", MTS.signet)).elevate(id1);
//     MTS.message(msg);
//     // let msg2 = (new MTSLib.Message("ReplyBBBB", "Oi!", MTS.signet)).elevate(id2);
//     // MTS.message(msg2);
// }, 5000);

app.listen(port, () => console.log(`Server listening on port ${ port }!`));