import Message from "./Message";
import Node from "./Node";

export default class Router {
    constructor(parent) {
        this._parent = parent;
        
        this._routes = {
            "*": []
        };
    }

    get(type, wildcard = false) {
        let routes = this._routes[ type ] || [];

        if(wildcard) {
            return [
                ...routes,
                ...this._routes[ "*" ]
            ];
        }

        return routes;
    }

    addRoute(nodeOrId, msgTypes = []) {
        if(nodeOrId instanceof Node) {
            nodeOrId = nodeOrId.id;
        }

        this.removeRoute(nodeOrId);

        if(msgTypes === "*" || msgTypes === true) {
            this._routes["*"].push(nodeOrId);
        } else {
            if(!Array.isArray(msgTypes)) {
                msgTypes = [ msgTypes ];
            }
            
            for(let type of msgTypes) {
                if(!Array.isArray(this._routes[ type ])) {
                    this._routes[ type ] = [];
                }
    
                if(!this._routes[ type ].includes(nodeOrId)) {
                    this._routes[ type ].push(nodeOrId);
                }
            }
        }

        return this;
    }
    removeRoute(nodeOrId) {
        if(nodeOrId instanceof Node) {
            nodeOrId = nodeOrId.id;
        }

        Object.entries(this._routes).forEach(([ type, mods ]) => {
            this._routes[ type ] = mods.filter(m => m !== nodeOrId);
        });

        return this;
    }

    //TODO Allow for "domain level" types (e.g. 'WebSocketNode.*') and create unique @nodes list to avoid duplicate .receive(...)
    route(msg) {
        if(Message.conforms(msg)) {
            if(msg._elevate) {
                this._parent.Network.route(msg);
            } else {
                let nodes = this.get(msg.type, true).map(id => this._parent.Registry.get(id));

                for(let node of nodes) {
                    if(node instanceof Node && node.signet !== msg.source) {
                        node.receive(msg);
                    }
                }
            }
        }

        return this;
    }
};