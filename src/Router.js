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

    addRoute(nodeName, msgTypes = []) {
        if(nodeName instanceof Node) {
            nodeName = nodeName.name;
        }

        this.removeRoute(nodeName);

        if(msgTypes === "*" || msgTypes === true) {
            this._routes["*"].push(nodeName);
        } else {
            for(let type of msgTypes) {
                if(!Array.isArray(this._routes[ type ])) {
                    this._routes[ type ] = [];
                }
    
                if(!this._routes[ type ].includes(nodeName)) {
                    this._routes[ type ].push(nodeName);
                }
            }
        }

        return this;
    }
    removeRoute(nodeName) {
        if(nodeName instanceof Node) {
            nodeName = nodeName.name;
        }

        Object.entries(this._routes).forEach(([ type, mods ]) => {
            this._routes[ type ] = mods.filter(m => m !== nodeName);
        });

        return this;
    }

    //TODO Allow for "domain level" types (e.g. 'WebSocketNode.*') and create unique @nodes list to avoid duplicate .receive(...)
    route(msg) {
        if(Message.conforms(msg)) {
            if(msg._elevate) {
                this._parent.Network.route(msg);
            } else {
                let nodes = this.get(msg.type, true).map(name => this._parent.Registry.get(name));

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