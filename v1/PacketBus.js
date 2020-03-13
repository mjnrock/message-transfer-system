import Message from "./Message";
import Packet from "./Packet";

export default class PacketBus {
    constructor(mts, {
        isReceiving = true,
        isProcessing = true,
        maxBatchSize = 1000
    } = {}) {
        this._mts = mts;

        this.queue = [];

        this.isReceiving = isReceiving;
        this.isProcessing = isProcessing;
        this.maxBatchSize = maxBatchSize;
    }

    size() {
        return this.queue.length;
    }
    isEmpty() {
        return this.queue.length === 0;
    }

    priority(packet) {
        if(Packet.conforms(packet)) {
            let msg = this.extract(packet);

            this._mts.Bus.Message.enqueue(msg);

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
                let packet = this.dequeue(),
                    msg = this.extract(packet);

                this._mts.Bus.Message.enqueue(msg);
            } else {
                return -1;
            }

            ++iters;
        }

        return this;
    }

    extract(packet) {
        if(Packet.conforms(packet)) {
            let msg = packet.payload;

            if(Message.conforms(msg)) {
                return msg;
            }
        }

        return false;
    }
}