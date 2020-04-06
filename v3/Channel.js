import Registry from "./Registry";
import Message from "./Message";
import Node from "./Node";
import { GenerateUUID } from "./util/helper";

export default class Channel {
    constructor(name = GenerateUUID()) {
        this.id = GenerateUUID();
        this.name = name;

        this.Registry = new Registry();
    }

    get signet() {
        return `${ this.name }<${ this.id }>`;
    }

    broadcast(type, payload) {
        if(Message.conforms(type)) {
            let msg = type;

            msg.source = this.signet;
            this.post(msg);
        } else {            
            this.post(
                new Message(type, payload, { source: this.signet } = {})
            );
        }
    }
    
    send(type, payload, { source, recipient } = {}) {
        this.message(
            new Message(type, payload, { source, recipient })
        );
    }
    message(msg) {
        if(Message.conforms(msg)) {
            if(msg.recipient) {
                let node = this.Registry.find(msg.recipient);
        
                if(node && typeof node.ChannelManager.receive === "function") {
                    node.ChannelManager.receive(this, msg);
                }
            } else {
                this.post(msg);
            }
        }
    }
    post(msg) {
        if(Message.conforms(msg)) {
            this.Registry.each(node => {
                if(typeof node.ChannelManager.receive === "function") {
                    node.ChannelManager.receive(this, msg);
                }
            });
        }
    }

    join(...nodes) {
        let success = this.Registry.register(...nodes);

        for(let node of success) {
            node.ChannelManager.join(this);
        }
    }
    leave() {
        let success = this.Registry.unregister(...nodes);

        for(let node of success) {
            if(node instanceof Node) {

            }
            node.ChannelManager.leave(this);
        }
    }
};