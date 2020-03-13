import MTS from "./package";

export default class Main {
    constructor(managers = []) {
        this.Registry = new MTS.Registry(this);
        this.MessageBus = new MTS.MessageBus(this);

        this.Registry.register(...managers);
    }

    // get register() {
    //     return this.Registry.register.bind(this.Registry);
    // }
    // get unregister() {
    //     return this.Registry.unregister.bind(this.Registry);
    // }

    // get add() {
    //     return this.MessageBus.add.bind(this.MessageBus);
    // }
    // get remove() {
    //     return this.MessageBus.remove.bind(this.MessageBus);
    // }

    // get route() {
    //     return this.MessageBus.route.bind(this.MessageBus);
    // }
}