import ChannelManager from "./ChannelManager";
import { GenerateUUID } from "./util/helper";

export default class Node {
    constructor({ name, receive } = {}) {
        this.id = GenerateUUID();
        this.name = name || GenerateUUID();

        this.ChannelManager = new ChannelManager(this);

        this._hooks = {
            receive: receive
        };
    }

    get signet() {
        return this.id;
    }

    send(type, payload, { recipient } = {}) {
        this.ChannelManager.send(type, payload, { recipient });
    }
    message(msg) {
        this.ChannelManager.message(msg);
    }
    receive(msg, channelInfo) {
        if(typeof this._hooks.receive === "function") {
            return this._hooks.receive(msg, channelInfo);
        }
    }
};