import MTSLib from "./src/package";

const express = require("express");
const path = require("path");
const app = express();
const expressWs = require("express-ws")(app);
const port = 3000;

app.use(express.static(path.join(__dirname, "/public")));
app.set("trust proxy", true);

//  https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server

const MTS = new MTSLib.Main();

//TODO There is presently no cleanup for disconnected clients
app.ws("/", function (ws, req) {
    let wsm = new MTSLib.Network.WebSocketManager(ws, { isServerSide: true });
    
    MTS.register(wsm);
    MTS.Router.addRoute(wsm, MTSLib.Network.WebSocketManager.AllMessageTypes());
});

app.listen(port, () => console.log(`Server listening on port ${ port }!`));