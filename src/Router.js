import Message from "./Message";
import Manager from "./Manager";

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

    addRoute(managerName, msgTypes = []) {
        if(managerName instanceof Manager) {
            managerName = managerName.name;
        }

        this.removeRoute(managerName);

        if(msgTypes === "*" || msgTypes === true) {
            this._routes["*"].push(managerName);
        } else {
            for(let type of msgTypes) {
                if(!Array.isArray(this._routes[ type ])) {
                    this._routes[ type ] = [];
                }
    
                if(!this._routes[ type ].includes(managerName)) {
                    this._routes[ type ].push(managerName);
                }
            }
        }

        return this;
    }
    removeRoute(managerName) {
        if(managerName instanceof Manager) {
            managerName = managerName.name;
        }

        Object.entries(this._routes).forEach(([ type, mods ]) => {
            this._routes[ type ] = mods.filter(m => m !== managerName);
        });

        return this;
    }

    //TODO Allow for "domain level" types (e.g. 'WebSocketManager.*') and create unique @managers list to avoid duplicate .receive(...)
    route(msg) {
        if(Message.conforms(msg)) {
            if(msg._elevate === true) {
                this._parent.Network.route(msg);
            } else {
                let managers = this.get(msg.type, true).map(name => this._parent.Registry.get(name));

                for(let mgr of managers) {
                    if(mgr instanceof Manager && mgr.signet !== msg.source) {
                        mgr.receive(msg);
                    }
                }
            }
        }

        return this;
    }
};