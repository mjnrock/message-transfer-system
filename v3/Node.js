import { GenerateUUID } from "./util/helper";
import Feed from "./Feed";

export default class Node {
    constructor({ name, receive } = {}) {
        this.id = GenerateUUID();
        this.name = name || GenerateUUID();

        this._feeds = [
            new Feed(this, { name: this.signet })
        ];
        this._hooks = {
            receive: receive
        };
    }

    get signet() {
        return this.id;
    }

    get Feed() {
        return this._feeds[ 0 ];    // Convenience function for the root feed
    }

    /**
     * If Array.isArray(nodes[ 0 ]), it will be used as a inclusive feed ID filter.
     * @param  {...Node} nodesOrFns 
     */
    listen(...nodesOrFns) {
        let feedList = this._feeds,
            potOpts = nodesOrFns[ 0 ];

        if(Array.isArray(potOpts)) {
            feedList = this._feeds.filter(f => potOpts.includes(f.id))
        }

        for(let feed of feedList) {
            for(let norf of nodesOrFns) {
                feed.listen(norf);
            }
        }
    }
    /**
     * If Array.isArray(nodes[ 0 ]), it will be used as a inclusive feed ID filter.
     * @param  {...Node} nodesOrFns 
     */
    unlisten(...nodesOrFns) {
        let feedList = this._feeds,
            potOpts = nodesOrFns[ 0 ];

        if(Array.isArray(potOpts)) {
            feedList = this._feeds.filter(f => potOpts.includes(f.id))
        }

        for(let feed of feedList) {
            for(let norf of nodesOrFns) {
                feed.unlisten(norf);
            }
        }
    }

    emit(type, payload, { shape } = {}) {
        for(let feed of this._feeds) {
            feed.emit(type, payload, { shape });
        }
    }
    receive(msg, feedInfo) {
        if(typeof this._hooks.receive === "function") {
            return this._hooks.receive(msg, feedInfo);
        }
    }
};