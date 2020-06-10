import MTS from "./../src/package";

(function() {    
    let Main = new MTS.Main();
    Main.toggleStateEmission();

    let id = Main.subscribe((msg) => console.log(msg));//setTimeout(() => console.log(msg), 0));

    console.log(id);
    Main.state = "CATS";
    console.log(Main._subscriptions);
})();