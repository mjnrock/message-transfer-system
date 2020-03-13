import Message from "./Message";
import Packet from "./Packet";
import Module from "./Module";

export default class MessageBus {
    constructor(mts, {
        isReceiving = true,
        isProcessing = true,
        maxBatchSize = 1000,
    } = {}) {
        this._mts = mts;

        this.queue = [];

        this.isReceiving = isReceiving;
        this.isProcessing = isProcessing;
        this.maxBatchSize = maxBatchSize;
    }

    /**
     * Allow the MessageBus to enqueue Messsages in an observable pattern
     * @param {Message} msg 
     */
    next(msg) {
        if(Message.conforms(msg)) {
            this.enqueue(msg);
        }
    }

    size() {
        return this.queue.length;
    }
    isEmpty() {
        return this.queue.length === 0;
    }

    priority(msg) {
        if(Message.conforms(msg)) {
            let mod = this._mts.Registry.get(msg.destination);

            if(mod instanceof Module) {
                mod.receive(msg.payload, msg);
            }

            return this;
        }

        return false;
    }

    enqueue(msg) {
        if(!this.isReceiving) {
            return false;
        }

        if(Message.conforms(msg)) {
            this.queue.push(msg);
        }

        return this;
    }
    dequeue() {
        return this.queue.pop();
    }

    process() {
        if(!this.isProcessing) {
            return false;
        }

        let iters = 0;

        for(let i = 0; i < this.queue.length; i++) {
            if(iters < this.maxBatchSize) {
                let msg = this.dequeue(),
                    mod = this._mts.Registry.get(msg.destination);

                if(mod instanceof Module) {
                    mod.receive(msg.payload, msg);
                }
            } else {
                return -1;
            }

            ++iters;
        }

        return this;
    }

    elevate(msg, protocol) {
        this._mts.Bus.Packet.enqueue(Packet.fromMessage(msg, protocol));

        return this;
    }

    extract(msg) {
        if(Message.conforms(msg)) {
            return msg.payload;
        }

        return false;
    }
}