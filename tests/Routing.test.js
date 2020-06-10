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
    
    let Main = new MTS.Main([
        Node1,
        Node2
    ]);

    Main.Router
        .addRoute(Node1.name, true)
        .addRoute(Node2.name, [ "Dog" ]);

    Main.get("node-1").send("Cat", "bootsandcatsandbootsandcats");
    Main.get("node-1").send("Dog", "purpies!");
    Main.get("node-2").send("Dog", "!seiprup");

    // Main.Router
    //     .route(new MTS.Message(
    //         "Cat",
    //         "KiTTIes!",
    //         15
    //     ))
    //     .route(new MTS.Message(
    //         "Dog",
    //         "PurPieS!",
    //         64
    //     ));
})();