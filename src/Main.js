import MTS from "./package";
import Message from "./Message";
import { GenerateUUID } from "./helper";

export default class Main {
    constructor({ isMaster = false, managers = [] } = {}) {
        this._manager = new MTS.Manager(GenerateUUID());

        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);
        this.Network = new MTS.Network.ConnectionBroker(this, { isMaster });

        this.Registry.register(this._manager, ...managers);
    }

    /**
     * On-demand module in scopes where <Window> exists
     * @param {<Window>} window 
     */
    loadInput(window) {
        let keys = new MTS.Input.KeyboardManager(window);
        let mouse = new MTS.Input.MouseManager(window);

        this.Input = {
            Key: keys,
            Mouse: mouse
        };

        return this;
    }

    //? Generic messaging system
    get signet() {
        return this._manager.signet;
    }
    get send() {
        return this._manager.send.bind(this._manager);
    }
    get message() {
        return this._manager.message.bind(this._manager);
    }

    //? Elevated registry functions
    get get() {
        return this.Registry.get.bind(this.Registry);
    }
    get register() {
        return this.Registry.register.bind(this.Registry);
    }
}