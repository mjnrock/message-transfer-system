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

const MTS = new MTSLib.Main({ isMaster: true });

//TODO There is presently no cleanup for disconnected clients
app.ws("/", function (ws, req) {
    MTS.Network.createWebSocket({ ws });
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