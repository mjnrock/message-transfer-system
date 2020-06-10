import Node from "./Node";

export default class Registry {
    constructor({ register = null, unregister = null } = {}) {
        this._entries = {};

        // Make this a Node registry, by default
        this._register = register || {
            key: node => node.id,
            check: node => node instanceof Node && !this.has(node.id)
        };
        this._unregister = unregister || {
            key: node => node.id,
            check: node => node instanceof Node && this.has(node.id)
        };
    }

    
    setRegister(keyFn, checkFn) {
        if(typeof keyFn === "function" && typeof checkFn === "function") {
            this._register = {
                key: keyFn,
                check: checkFn
            }
        }
    }
    setUnregister(keyFn, checkFn) {
        if(typeof keyFn === "function" && typeof checkFn === "function") {
            this._unregister = {
                key: keyFn,
                check: checkFn
            }
        }
    }

    
    has(id) {
        return !!this._entries[ id ];
    }
    get(id) {
        return this._entries[ id ];
    }

    find(nameOrId) {
        let [ res ] = Object.values(this._entries).filter(ent => ent.name === nameOrId) || [];

        if(res.length === 0) {
            return this.get(nameOrId);
        }

        return res;
    }

    updateId(oldId, newId) {
        let entry = this._entries[ oldId ];

        if(entry) {
            delete this._entries[ oldId ];
            this._entries[ newId ] = entry;
        }

        return this;
    }
    

    each(fn) {
        if(typeof fn === "function") {
            Object.values(this._entries).forEach((entry, i) => fn(entry, i));
        }

        return this;
    }
    filter(fn) {
        if(typeof fn === "function") {
            return Object.values(this._entries).filter(fn);
        }

        return [];
    }
    map(fn) {
        if(typeof fn === "function") {
            return Object.values(this._entries).map(fn);
        }

        return [];
    }


    register(...entries) {
        let success = [];
        for(let entry of entries) {
            if(this._register.check(entry) === true) {
                this._entries[ this._register.key(entry) ] = entry;

                success.push(entry);
            }
        }

        return success;
    }
    unregister(...entries) {
        let success = [];
        for(let entry of entries) {
            if(this._unregister.check(entry) === true) {
                delete this._entries[ this._unregister.key(entry) ];

                success.push(entry);
            }
        }

        return success;
    }
};