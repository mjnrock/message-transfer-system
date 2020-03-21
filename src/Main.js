import MTS from "./package";
import Message from "./Message";
import { GenerateUUID } from "./helper";

export default class Main {
    constructor({ managers = [] } = {}) {
        this._manager = new MTS.Manager(GenerateUUID());

        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);

        this.Registry.register(this._manager, ...managers);
    }


    /**
     * On-demand module for network communication
     * @param {boolean} isMaster 
     */
    loadNetwork(isMaster = false) {
        this.Network = new MTS.Network.ConnectionBroker(this, { isMaster });

        return this;
    }
    /**
     * On-demand module in scopes where <Window> exists
     * @param {<Window>} window 
     */
    loadInput(window, { mouse = true, keys = true } = {}) {
        if(mouse) {
            let mouse = new MTS.Input.MouseManager(window);
            
            this.Input = this.Input || {};
            this.Input[ "Mouse" ] = mouse;
            
            this.register(this.Input.Mouse);
        }

        if(keys) {
            let keys = new MTS.Input.KeyboardManager(window);
            
            this.Input = this.Input || {};
            this.Input[ "Keys" ] = keys;
            
            this.register(this.Input.Keys);
        }

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