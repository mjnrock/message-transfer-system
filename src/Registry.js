import Manager from "./Manager";
import WebSocketManager from "./network/WebSocketManager";

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

    register(...managers) {
        for(let manager of managers) {
            if(manager instanceof Manager) {
                manager._parent = this._parent;
                this._entries[ manager.name ] = manager;

                //? Special routing instructions for convenience
                if(manager instanceof WebSocketManager) {
                    manager._parent.Router.addRoute(manager, WebSocketManager.AllSignalTypes());
                }
            }
        }

        return this;
    }
    unregister(...managers) {
        for(let manager of managers) {
            if(manager instanceof Manager) {
                manager._parent = null;
                delete this._entries[ manager.name ];

                //? Special routing instructions for convenience
                if(manager instanceof WebSocketManager) {
                    manager._parent.Router.removeRoute(manager, WebSocketManager.AllSignalTypes());
                }
            }
        }

        return this;
    }
};