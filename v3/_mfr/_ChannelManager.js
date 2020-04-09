import Channel from "./Channel";
import { GenerateUUID } from "../util/helper";

export default class ChannelManager {
    constructor(node) {
        this.id = GenerateUUID();
        this.node = node;

        this._channels = {};
        this._current = null;
        this._mapping = {};
    }


    register(channel, ...types) {
        if(types[ 0 ] === true) {
            this._mapping[ channel.id ] = true;
        } else {
            this._mapping[ channel.id ] = types;
        }
    }
    unregister(channel, ...types) {
        if(this._mapping[ channel.id ] === true) {            
            delete this._mapping[ channel.id ];
        } else {            
            this._mapping[ channel.id ] = this._mapping[ channel.id ].filter(type => !types.includes(type));
        }
    }


    get channel() {
        if(!this._current) {
            return Object.values(this._channels)[ 0 ];
        }

        return this._current;
    }

    get(nameOrId) {
        let channel = this._channels[ nameOrId ];

        if(channel) {
            return channel;
        }

        return Object.values(this._channels).filter(ch => ch.name === nameOrId)[ 0 ];
    }
    use(id) {
        if(this._channels[ id ] instanceof Channel) {
            this._current = this._channels[ id ];
        }
    }
    join(channel) {
        this._channels[ channel.id ] = channel;
        this.register(channel, true);

        if(!this._current) {
            this.use(channel.id);
        }

        return this;
    }
    leave(channel) {
        delete this._channels[ channel.id ];
        this.unregister(channel, true);

        if(this._current === channel) {
            this._current = null;
        }
    }
    
    send(type, payload, { recipient } = {}) {
        for(let id in this._mapping) {
            if(this._mapping[ id ] === true || this._mapping[ id ].includes(type)) {
                this._channels[ id ].send(type, payload, { source: this.node.signet, recipient });
            }
        }
    }
    message(msg, { recipient } = {}) {
        if(Message.conforms(msg)) {            
            for(let id in this._mapping) {
                if(this._mapping[ id ] === true || this._mapping[ id ].includes(type)) {
                    ch.message(msg, { recipient });
                }
            }
        }
    }

    receive(channel, message) {
        if(message.source !== this.node.signet) {
            return this.node.receive(message, {
                id: channel.id,
                name: channel.name,
                signet: channel.signet
            });
        }
    }
}