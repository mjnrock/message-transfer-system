import MTS from "./../src/package";

(function() {
    let Node1 = new MTS.Node("node-1", {
        receive: (msg) => {
            console.log("11111111111111111111");
            console.log(msg);
            console.log("11111111111111111111");
        }
    });
    let Node2 = new MTS.Node("node-2", {
        receive: (msg) => {
            console.log("22222222222222222222");
            console.log(msg);
            console.log("22222222222222222222");
        }
    });

    Node1.subscribe(Node2);
    Node1.subscribeTo(Node2);
    Node2.subscribe(Node1);   // Should do nothing, and it seems to work correctly

    Node1.packager = (type, payload) => new MTS.Message(type, payload, "CATS");  // Custom packager works, too

    Node1.emit("Cats", "Kitties!");
    Node2.emit("Dogs", "Purpies!");
})();