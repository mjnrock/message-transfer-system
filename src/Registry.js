import Node from "./Node";
import WebSocketNode from "./network/WebSocketNode";
import KeyboardNode from "./browser/KeyboardNode";
import MouseNode from "./browser/MouseNode";

export default class Registry {
    constructor(parent) {
        this._parent = parent;

        this._entries = {};
    }

    lookup(id) {
        return Object.values(this._entries).filter(ent => ent.id === id);
    }
    
    get(name) {
        return this._entries[ name ];
    }

    register(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                node._parent = this._parent;
                this._entries[ node.name ] = node;

                //? Special routing instructions for convenience
                if(node instanceof WebSocketNode) {
                    node._parent.Router.addRoute(node, WebSocketNode.AllSignalTypes());
                } else if(node instanceof KeyboardNode) {
                    node._parent.Router.addRoute(node, KeyboardNode.AllSignalTypes());
                } else if(node instanceof MouseNode) {
                    node._parent.Router.addRoute(node, MouseNode.AllSignalTypes());
                }
            }
        }

        return this;
    }
    unregister(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                node._parent = null;
                delete this._entries[ node.name ];

                //? Special routing instructions for convenience
                if(node instanceof WebSocketNode) {
                    node._parent.Router.removeRoute(node, WebSocketNode.AllSignalTypes());
                } else if(node instanceof KeyboardNode) {
                    node._parent.Router.removeRoute(node, KeyboardNode.AllSignalTypes());
                } else if(node instanceof MouseNode) {
                    node._parent.Router.removeRoute(node, MouseNode.AllSignalTypes());
                }
            }
        }

        return this;
    }
};