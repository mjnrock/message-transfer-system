import Node from "./Node";
import WebSocketNode from "./network/WebSocketNode";
import KeyboardNode from "./browser/input/KeyboardNode";
import MouseNode from "./browser/input/MouseNode";

export default class Registry {
    constructor(parent) {
        this._parent = parent;

        this._entries = {};
    }

    lookup(id) {
        return Object.values(this._entries).filter(ent => ent.id === id);
    }
    
    has(name) {
        return !!this._entries[ name ];
    }
    get(name) {
        return this._entries[ name ];
    }

    register(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node && !this.has(node.name)) {
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
            if(node instanceof Node && this.has(node.name)) {
                node._parent = null;
                delete this._entries[ node.name ];

                //? Special routing instructions for convenience
                if(node instanceof WebSocketNode) {
                    this._parent.Router.removeRoute(node, WebSocketNode.AllSignalTypes());
                } else if(node instanceof KeyboardNode) {
                    this._parent.Router.removeRoute(node, KeyboardNode.AllSignalTypes());
                } else if(node instanceof MouseNode) {
                    this._parent.Router.removeRoute(node, MouseNode.AllSignalTypes());
                }
            }
        }

        return this;
    }
};