import MTS from "./package";
import Repeater from "./Repeater";

export default class Main extends Repeater {
    /**
     * This class extends the Repeater class, which extends Node.  As such, it has timer/interval functionality exposed natively.  See Repeater for more details.
     * @param {Node[]} nodes DEFAULT: [] | A list of Nodes to register after initialization
     * @param {fn} receive DEFAULT: null | The receiver function for this Node | @receive = null evaluates to `() => true`
     * @param {true|Message.type[]} routes DEFAULT: true | An array of routes for this Node to `.receive(msg)`
     */
    constructor({ nodes = [], receive = null, routes = true } = {}) {
        super({ receive });
        this._parent = this;

        this.Registry = new MTS.Registry(this);
        this.Router = new MTS.Router(this);

        this.Registry.register(this, ...nodes);
        this.Router.addRoute(this, routes);
    }


    /**
     * On-demand module for network communication
     * @param {boolean} isMaster DEFAULT: false | Establish this broker as a Master or Slave
     * @param {true|Message.type[]} routes An array of routes for the ConnectionBroker to REPEAT/BROADCAST OVER THE NETWORK to ALL connections
     */
    loadNetwork(isMaster = false, { routes = [] } = {}) {
        this.Network = new MTS.Network.ConnectionBroker(this, { isMaster });
        
        this.register(this.Network);

        if(routes.length) {
            this.Router.addRoute(this.Network, routes);
        }

        return this;
    }
    /**
     * On-demand module in scopes where <Window> exists
     * @param {obj} opts Exposes MTS.Browser.Input Nodes to activate
     */
    loadBrowserInput({ mouse = true, mouseComplex = false, keys = true } = {}) {
        if(!window) {
            throw new Error("Window is not supported");
        }

        if(mouse || mouseComplex) {
            let mouse = new MTS.Browser.Input.MouseNode(window);

            if(mouseComplex === true) {
                mouse.toggleComplexActions();
            }
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Mouse" ] = mouse;
            
            this.register(this.Browser.Input.Mouse);
        }

        if(keys) {
            let keys = new MTS.Browser.Input.KeyboardNode(window);
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Keys" ] = keys;
            
            this.register(this.Browser.Input.Keys);
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
    get unregister() {
        return this.Registry.unregister.bind(this.Registry);
    }
}