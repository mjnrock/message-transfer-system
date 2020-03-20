import MTSLib from "./../src/package";

const MTS = new MTSLib.Main();
MTS.Network.WebSocket.create({ uri: `localhost:3000` });

setTimeout(() => {
    let msg = (new MTSLib.Message("RouteTest", 12345, MTS.signet)).elevate();

    MTS.message(msg);
}, 1000);