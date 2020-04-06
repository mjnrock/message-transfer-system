import Channel from "./Channel";
import { GenerateUUID } from "./util/helper";

export default class ChannelManager {
    constructor(node) {
        this.id = GenerateUUID();
        this.node = node;

        this._channels = {};
        this._current = null;
    }

    get channel() {
        return this._current;
    }

    get(id) {
        return this._channels[ id ];
    }
    use(id) {
        if(this._channels[ id ] instanceof Channel) {
            this._current = this._channels[ id ];
        }
    }
    join(channel) {
        this._channels[ channel.id ] = channel;

        if(!this._current) {
            this.use(channel.id);
        }

        return this;
    }
    leave(channel) {
        delete this._channels[ channel.id ];

        if(this._current === channel) {
            this._current = null;
        }
    }
    
    send(type, payload, { recipient } = {}) {
        this.channel.send(type, payload, { source: this.node.signet, recipient });
    }
    message(msg) {
        if(Message.conforms(msg)) {
            msg.source = this.node.signet;
            
            this.channel.message(msg);
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