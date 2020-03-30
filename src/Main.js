import Network from "./network/package";
import Browser from "./browser/package";

import Registry from "./Registry";
import Router from "./Router";
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

        this.Registry = new Registry(this);
        this.Router = new Router(this);

        this.Registry.register(this, ...nodes);
        this.Router.addRoute(this, routes);
    }


    /**
     * On-demand module for network communication
     * @param {boolean} isMaster DEFAULT: false | Establish this broker as a Master or Slave
     * @param {true|Message.type[]} routes An array of routes for the ConnectionBroker to REPEAT/BROADCAST OVER THE NETWORK to ALL connections
     */
    loadNetwork(isMaster = false, { routes = [] } = {}) {
        this.Network = new Network.ConnectionBroker(this, { isMaster });
        
        console.log(`CB: ${ this.Network.id }`);
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
    loadBrowserInput({ mouse = false, mouseComplex = false, touch = false, keys = false } = {}) {
        if(!window) {
            throw new Error("Window is not supported");
        }

        if(mouse || mouseComplex) {
            let mouse = new Browser.Input.MouseNode();

            if(mouseComplex === true) {
                mouse.toggleComplexActions();
            }
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Mouse" ] = mouse;
            
            this.register(this.Browser.Input.Mouse);
        }

        if(touch) {
            let touch = new Browser.Input.TouchNode();
            
            this.Browser = this.Browser || {};
            this.Browser.Input = this.Browser.Input || {};
            this.Browser.Input[ "Touch" ] = touch;
            
            this.register(this.Browser.Input.Touch);
        }

        if(keys) {
            let keys = new Browser.Input.KeyboardNode();
            
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