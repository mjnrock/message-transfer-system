import Message from "./Message";

export default class Manager {
    constructor(name, { receive = null, parent = null } = {}) {
        this.id = Symbol(name);
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
        this._parent.MessageBus.route(new Message(
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

    subscribe(nextOrFn) {
        let uuid,
            sub;

        if(typeof nextOrFn === "function" || typeof nextOrFn.next === "function") {
            sub = nextOrFn;
            uuid = GenerateUUID();
        }

        if(uuid) {
            this._subscriptions[ uuid ] = sub;

            return uuid;
        }

        return false;
    }
    
    unsubscribe(fnOrUuid) {
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

        if (typeof fnOrUuid === "string" || fnOrUuid instanceof String) {
            delete this._subscriptions[fnOrUuid];
        } else if (typeof fnOrUuid.next === "function" || typeof fnOrUuid === "function") {
            let fn = fnOrUuid.next || fnOrUuid,
                hash = hashCode(fn.toString());

            for (let [ key, sub ] of Object.entries(this._subscriptions)) {
                if (typeof sub.next === "function" || typeof sub === "function") {
                    let ifn = sub.next || sub;

                    if (hashCode(ifn.toString()) === hash) {
                        delete this._subscriptions[key];

                        return this;
                    }
                }
            }
        }

        return this;
    }
};