import { GenerateUUID } from "./helper";
import Event from "./Event";
import Message from "./Message";

export default class Module {
    constructor(name, next = null) {
        this.uuid = GenerateUUID();
        this.name = name;

        this._mts = null;
        this._next = next;
        this._receive = null;
        this._subscriptions = {};
    }

    get next(...args) {
        if(typeof this._next === "function") {
            return this._next(...args);
        }
    }
    set next(fn) {
        if(typeof fn === "function") {
            this._next = fn;
        }
    }
    
    /**
     * Directly queue a Message to be sent to another Module
     * @param {Message} msg 
     */
    send(msg) {
        this._mts.Bus.Message.enqueue(msg);

        return this;
    }
    /**
     * 
     * @param {Message} msg 
     */
    
    get receive(msg) {
        if(typeof this._receive === "function") {
            return this._receive(msg);
        }
    }
    set receive(fn) {
        if(typeof fn === "function") {
            this._receive = fn;
        }
    }

    /**
     * Invoke the MTS module's .next(msg) function, passing the Event wrapped in a Message to be forwarded to another Module
     * @param {string} type 
     * @param {string} destination 
     * @param {Event} e 
     */
    forward(type, destination, e) {
        if(e instanceof Event) {
            this._mts.next(new Message(
                type,
                e,
                destination,
                this
            ));
        }

        return this;
    }

    /**
     * Emit an Event to all subscribers' .next(e)
     * @param {Event|string} eOrType 
     * @param {any} payload 
     */
    emit(eOrType, payload) {
        let e;

        if(args.length === 1) {
            e = eOrType;
        } else if(args.length === 2) {
            e = new Event(eOrType, payload, this);
        }

        if(e instanceof Event) {
            for(let sub of Object.values(this._subscriptions)) {
                if(typeof sub.next === "function") {
                    sub.next(e);
                } else if(typeof sub === "function") {
                    sub(e);
                }
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
    
    unsubscribe(subOrUUID) {
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

        if (typeof subOrUUID === "string" || subOrUUID instanceof String) {
            delete this._subscriptions[subOrUUID];
        } else if (typeof subOrUUID.next === "function" || typeof subOrUUID === "function") {
            let fn = subOrUUID.next || subOrUUID,
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
}