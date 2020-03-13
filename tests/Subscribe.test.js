import MTS from "../package";

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

    Mgr1.subscribe(Mgr2);
    Mgr1.subscribeTo(Mgr2);
    Mgr2.subscribe(Mgr1);   // Should do nothing, and it seems to work correctly

    Mgr1.emit("Cats", "Kitties!");
    Mgr2.emit("Dogs", "Purpies!");
})();