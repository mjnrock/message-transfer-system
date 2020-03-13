import { GenerateUUID } from "./helper";
import Message from "./Message";

export default class Manager {
    constructor(name, { receive = null, parent = null } = {}) {
        this.id = GenerateUUID();
        this.name = name;

        this._parent = parent;
        this._receive = receive;
        this._subscriptions = {};
    }

    get signet() {
        return this.id;
    }

    get receive() {
        return this._receive;
    }
    set receive(fn) {
        if(typeof fn === "function") {
            this._receive = fn;

            return true;
        }

        return false;
    }

    send(type, payload) {
        this._parent.Router.route(new Message(
            type,
            payload,
            this.signet
        ));
    }

    emit(type, payload) {
        let msg = new Message(
            type,
            payload,
            this.signet
        );

        for(let sub of Object.values(this._subscriptions)) {
            if(typeof sub.receive === "function") {
                sub.receive(msg);
            } else if(typeof sub === "function") {
                sub(msg);
            }
        }

        return this;
    }

    subscribe(mgrOrFn) {
        let id,
            sub;

        if(mgrOrFn instanceof Manager) {
            sub = mgrOrFn;
            id = mgrOrFn.id;
        } else if(typeof mgrOrFn === "function" || typeof mgrOrFn.receive === "function") {
            sub = mgrOrFn;
            id = GenerateUUID();
        }

        if(id) {
            this._subscriptions[ id ] = sub;

            return id;
        }

        return false;
    }

    subscribeTo(mgr) {
        if(mgr instanceof Manager) {
            return mgr.subscribe(this);
        }

        return false;
    }
    
    unsubscribe(mgrFnOrId) {
        let hashCode = str => {
            let hash = 0, i, chr;

            if(str.length === 0) {
                return hash;
            }

            for(i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        };

        if (mgrFnOrId instanceof Manager) {
            delete this._subscriptions[ mgrFnOrId.id ];
        } else if (typeof mgrFnOrId === "string" || mgrFnOrId instanceof String) {
            delete this._subscriptions[ mgrFnOrId ];
        } else if (typeof mgrFnOrId.receive === "function" || typeof mgrFnOrId === "function") {
            let fn = mgrFnOrId.receive || mgrFnOrId,
                hash = hashCode(fn.toString());

            for (let [ key, sub ] of Object.entries(this._subscriptions)) {
                if (typeof sub.receive === "function" || typeof sub === "function") {
                    let ifn = sub.receive || sub;

                    if (hashCode(ifn.toString()) === hash) {
                        delete this._subscriptions[key];

                        return this;
                    }
                }
            }
        }

        return this;
    }

    unsubscribeTo(mgr) {
        if(mgr instanceof Manager) {
            return mgr.unsubscribe(this);
        }

        return false;
    }
};