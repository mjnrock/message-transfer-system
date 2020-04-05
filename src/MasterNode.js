import Registry from "./Registry";
import Router from "./Router";
import Repeater from "./Repeater";

export default class MasterNode extends Repeater {
    /**
     * This class extends the Repeater class, which extends Node.  As such, it has timer/interval functionality exposed natively.  See Repeater for more details.
     * @param {Node[]} nodes DEFAULT: [] | A list of Nodes to register after initialization
     * @param {fn} receive DEFAULT: null | The receiver function for this Node | @receive = null evaluates to `() => true`
     * @param {true|Message.type[]} routes DEFAULT: true | An array of routes for this Node to `.receive(msg)`
     */
    constructor({ nodes = [], receive = null, routes = true, name = null } = {}) {
        super({ name, receive });
        this._mnode = this;

        this.Registry = new Registry(this);
        this.Router = new Router(this);

        this.Registry.register(this, ...nodes);
        this.Router.addRoute(this, routes);
    }

    
    //? Elevated registry functions
    get get() {
        return this.Registry.get.bind(this.Registry);
    }
    get find() {
        return this.Registry.find.bind(this.Registry);
    }
    get register() {
        return this.Registry.register.bind(this.Registry);
    }
    get unregister() {
        return this.Registry.unregister.bind(this.Registry);
    }
}