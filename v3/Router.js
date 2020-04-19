import Node from "./Node"
import Condition from "./Condition";

export default class Router extends Node {
    constructor() {
        this._routes = {};
    }

    register(node, condition) {
        if(node instanceof Node && (typeof condition === "function" || condition instanceof Condition)) {
            this._routes[ node.id ] = {
                node,
                condition: condition instanceof Condition ? condition.package : condition
            };
        }
    }
    unregister(node) {
        if(node instanceof Node) {
            delete this._routes[ node.id ];
        }
    }

    receive(msg, feed) {
        super.receive(msg, feed);

        for(let { node, condition } of this._routes) {
            if(condition(msg, feed) === true) {
                node.receive(msg, feed);
            }
        }
    }
}