import MTS from "./../package";

(function() {
    let Mgr1 = new MTS.Manager("mgr-1", {
        receive: (msg) => {
            console.log("11111111111111111111");
            console.log(msg);
            console.log("11111111111111111111");
        }
    });
    let Mgr2 = new MTS.Manager("mgr-2", {
        receive: (msg) => {
            console.log("22222222222222222222");
            console.log(msg);
            console.log("22222222222222222222");
        }
    });
    
    let Main = new MTS.Main([
        Mgr1,
        Mgr2
    ]);

    Main.MessageBus
        .addRoute(Mgr1.name, true)
        .addRoute(Mgr2.name, [ "Dog" ]);

    Main.get("mgr-1").send("Cat", "bootsandcatsandbootsandcats");
    Main.get("mgr-1").send("Dog", "purpies!");
    Main.get("mgr-2").send("Dog", "!seiprup");

    // Main.MessageBus
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