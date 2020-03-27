import Node from "./Node";
import WebSocketNode from "./network/WebSocketNode";
import KeyboardNode from "./browser/input/KeyboardNode";
import MouseNode from "./browser/input/MouseNode";

export default class Registry {
    constructor(parent) {
        this._parent = parent;

        this._entries = {};
    }

    static SanitizeId(id) {
        if(id.substring(0, 2) === "C:" || id.substring(0, 2) === "S:") {
            return id.substring(2);
        }

        return id;
    }

    lookup(name) {
        return Object.values(this._entries).filter(ent => ent.name === name);
    }
    
    has(id) {
        let sid = Registry.SanitizeId(id);

        return !!this._entries[ sid ];
    }
    get(id) {        
        let sid = Registry.SanitizeId(id);

        return this._entries[ sid ];
    }

    changeId(oldId, newId) {
        let entry = this._entries[ oldId ];

        if(entry) {
            delete this._entries[ oldId ];
            this._entries[ newId ] = entry;
        }

        return this;
    }

    register(...nodes) {
        let successfulNodes = [];
        for(let node of nodes) {
            if(node instanceof Node && !this.has(node.id)) {
                node._parent = this._parent;
                this._entries[ node.id ] = node;

                successfulNodes.push(node);

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

        return successfulNodes;
    }
    unregister(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node && this.has(node.id)) {
                node._parent = null;
                delete this._entries[ node.id ];

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