import { GenerateUUID } from "./util/helper";
import Feed from "./Feed";

export default class Node {
    static SignalTypes = {
        STATE_CHANGE: "Node.StateChange",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(Node.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    /**
     * @param isPublic bool | DEFAULT: false | Will determine whether state updates should be emitted or not
     */
    constructor({ name, receive, isPublic = false } = {}) {
        this.id = GenerateUUID();
        this.name = name || GenerateUUID();

        this._feeds = [
            new Feed(this, { name: this.signet })
        ];

        this._state = {};

        this._hooks = {
            receive: receive
        };
        this._config = {
            isPublic: isPublic
        };
    }

    get config() {
        return this._config;
    }

    get state() {
        return this._state;
    }
    set state(state) {
        if(typeof state === "object") {
            let oldValue = this.state;
            this._state = state;

            if(this.config.isPublic === true) {
                this.emit(
                    Node.SignalTypes.STATE_CHANGE,
                    {
                        current: this.state,
                        previous: oldValue
                    }
                );
            }
        }
    }

    /**
     * This is a getter with optional setter, depending on whether or not @value is provided.
     * It will always return the hook.
     */
    hook(key, value) {
        if(value !== void 0) {
            this._hooks[ key ] = value;
        }

        return this._hooks[ key ];
    }

    get signet() {
        return this.id;
    }

    feed(indexIdNameOrSignet) {
        if(typeof indexIdNameOrSignet === "number") {
            return this._feeds[ indexIdNameOrSignet ];
        } else {
            for(let feed of this._feeds) {
                if(indexIdNameOrSignet === feed.signet || indexIdNameOrSignet === feed.id ||indexIdNameOrSignet === feed.name) {
                    return feed;
                }
            }
        }

        return false;
    }
    get Feed() {
        return this.feed(this.signet);    // Convenience function for the root feed.  Uses `this.signet` in case it is no longer index = 0, for w/e reason.
    }

    /**
     * If Array.isArray(nodes[ 0 ]), it will be used as a inclusive feed filter (accepts IDs, Names, or Signets)
     * @param  {...Node} nodesOrFns 
     */
    addListener(...nodesOrFns) {
        let feedList = this._feeds,
            ptnlFilter = nodesOrFns[ 0 ];

        if(Array.isArray(ptnlFilter)) {
            feedList = this._feeds.filter(f => ptnlFilter.includes(f.signet) || ptnlFilter.includes(f.id) || ptnlFilter.includes(f.name))
        }

        for(let feed of feedList) {
            for(let norf of nodesOrFns) {
                feed.listen(norf);
            }
        }
    }
    listen(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                node.addListener(this);
            }
        }
    }
    /**
     * If Array.isArray(nodes[ 0 ]), it will be used as a inclusive feed filter (accepts IDs, Names, or Signets)
     * @param  {...Node} nodesOrFns 
     */
    removeListener(...nodesOrFns) {
        let feedList = this._feeds,
            ptnlFilter = nodesOrFns[ 0 ];

        if(Array.isArray(ptnlFilter)) {
            feedList = this._feeds.filter(f => ptnlFilter.includes(f.signet) || ptnlFilter.includes(f.id) || ptnlFilter.includes(f.name))
        }

        for(let feed of feedList) {
            for(let norf of nodesOrFns) {
                feed.unlisten(norf);
            }
        }
    }
    unlisten(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                node.removeListener(this);
            }
        }
    }

    /**
     * A convenience function that invokes the `.listen` method on `this` and on each node passed, to create two-way listening.
     */
    couple(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                this.addListener(node);
                node.addListener(this);
            }
        }
    }
    /**
     * A convenience function that invokes the `.unlisten` method on `this` and on each node passed, to destroy two-way listening.
     */
    decouple(...nodes) {
        for(let node of nodes) {
            if(node instanceof Node) {
                this.removeListener(node);
                node.removeListener(this);
            }
        }
    }

    emit(type, payload, { shape, destination } = {}) {
        for(let feed of this._feeds) {
            feed.emit(type, payload, { shape, destination });
        }
    }

    receive(signal, feed) {
        if(typeof this._hooks.receive === "function") {
            return this._hooks.receive(signal, feed);
        }
    }
};