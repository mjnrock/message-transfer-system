const express = require("express");
const path = require("path");
const app = express();
const expressWs = require("express-ws")(app);
const port = 3000;

app.use(express.static(path.join(__dirname, "/public")));
app.set("trust proxy", true);

//  https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server

app.ws("/", function (ws, req) {
    //TODO Instantiate a Server.WebSocketManager(ws) and .register to the server Main instance
    ws.on("message", function (msg) {
        console.log(msg);
        ws.send("You have connected to the server!");
    });
});

app.listen(port, () => console.log(`Server listening on port ${ port }!`));