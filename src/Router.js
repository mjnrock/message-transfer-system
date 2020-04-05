import Message from "./Message";
import Node from "./Node";

export default class Router {
    constructor(mnode) {
        this._mnode = mnode;
        
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
                if(typeof msg._elevate === "string" || msg._elevate instanceof String) {
                    let local = this._mnode.Registry.get(msg._elevate);
                    // let local = this._mnode.Registry.get(msg._elevate),
                    //     lookups = this._mnode.Registry.find(msg._elevate);

                    if(local instanceof Node) {     // Prioritize direct Registry entries first
                        local.receive(msg);
                    // } else if(lookups.length) {     // Secondarily direct to any Nodes with a given name
                    //     for(let node of lookups) {
                    //         if(node instanceof Node && node.signet !== msg.source) {
                    //             node.receive(msg);
                    //         }
                    //     }

                        return this;
                    } 
                }
                
                this._mnode.Network.route(msg);
            } else {
                let nodes = this.get(msg.type, true).map(id => this._mnode.Registry.get(id));

                for(let node of nodes) {
                    // if(node instanceof Node && node.signet !== msg.source) {
                    if(node instanceof Node) {
                        node.receive(msg);
                    }
                }
            }
        }

        return this;
    }
};