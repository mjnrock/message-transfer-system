import Manager from "./Manager";

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
            }
        }

        return this;
    }
    unregister(...managers) {
        for(let manager of managers) {
            if(manager instanceof Manager) {
                manager._parent = null;
                delete this._entries[ manager.name ];
            }
        }

        return this;
    }
};