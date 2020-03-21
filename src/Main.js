import MTS from "./package";
import Manager from "./Manager";
import { GenerateUUID } from "./helper";

export default class Main extends Manager {
    constructor({ managers = [] } = {}) {
        super(GenerateUUID());
        this._parent = this;

        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);

        this.Registry.register(this, ...managers);
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

    
    //? Elevated registry functions
    get get() {
        return this.Registry.get.bind(this.Registry);
    }
    get register() {
        return this.Registry.register.bind(this.Registry);
    }
}