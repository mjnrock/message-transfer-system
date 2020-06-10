import Registry from "../Registry";
import Router from "../Router";
import Node from "../Node";
import Condition from "../Condition";

export default class MasterNode extends Node {
    constructor({ name, receive } = {}) {
        super({ name, receive });        
        
        this._config = {
            ...this._config,
            Registry: new Registry(),
            Router: new Router(),
        };
    }

    get Registry() {
        return this.config.Registry;
    }
    get Router() {
        return this.config.Router;
    }

    register(node, condition) {
        if(node instanceof Node && (condition instanceof Condition || typeof condition === "function")) {
            this.Registry.register(node);
            this.Router.register(node, condition);
        }
    }

    unregister(node) {
        if(node instanceof Node) {
            this.Registry.unregister(node);
            this.Router.unregister(node);
        }
    }
};