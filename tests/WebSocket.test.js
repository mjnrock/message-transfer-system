import MTSLib from "./../src/package";

//  Artificial Client #1
const MTS = (new MTSLib.Main()).loadNetwork(false);
MTS.Network.createWebSocket({ uri: `localhost:3000` });


setTimeout(() => {
    let msg = (new MTSLib.Message("RouteTest", 12345, MTS.Network.getWebSocket().signet)).elevate();

    MTS.message(msg);
}, 1000);


//  Artificial Client #2
const MTS2 = (new MTSLib.Main()).loadNetwork(false);
MTS2.Network.createWebSocket({ uri: `localhost:3000` });

setTimeout(() => {
    let msg = (new MTSLib.Message("RouteTest2", 12345, MTS2.Network.getWebSocket().signet)).elevate();

    MTS2.message(msg);
}, 1000);