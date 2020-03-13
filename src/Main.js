import MTS from "./package";

export default class Main {
    constructor(managers = []) {
        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);

        this.Registry.register(...managers);
    }

    get get() {
        return this.Registry.get.bind(this.Registry);
    }
    get register() {
        return this.Registry.register.bind(this.Registry);
    }
}