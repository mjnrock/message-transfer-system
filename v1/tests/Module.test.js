import Main from "./../Main";

const MTS = Main.create((...args) => console.log(...args));

let ModuleA = new Main.Module("mod-a", (...args) => {
    console.log(...args);
    console.log(MTS.Registry.lookup(args[ 0 ].emitter));
});

MTS.Registry.register(ModuleA, { twoWay: true });

MTS.emit("EVENT_TYPE_1", "Kitties!");
ModuleA.emit("EVENT_TYPE_2", "Purpies!");