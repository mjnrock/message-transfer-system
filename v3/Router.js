import Node from "./Node"
import Condition from "./Condition";

export default class Router extends Node {
    constructor({ name, receive } = {}) {
        super({ name, receive });

        this._routes = {};
    }

    register(node, condition) {
        if(node instanceof Node && (typeof condition === "function" || condition instanceof Condition)) {
            this._routes[ node.id ] = {
                node,
                condition: condition instanceof Condition ? condition.package : condition
            };

            this.listen(node);
        }
    }
    unregister(node) {
        if(node instanceof Node) {
            delete this._routes[ node.id ];
            
            this.unlisten(node);
        }
    }

    receive(msg, feed) {
        super.receive(msg, feed);

        for(let { node, condition } of Object.values(this._routes)) {
            if(condition(msg, feed) === true) {
                node.receive(msg, feed);
            }
        }
    }
}