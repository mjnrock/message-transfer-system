import WebSocket from "ws";

import { GenerateUUID } from "./helper";
import Manager from "./Manager";
import Message from "./Message";

export default class WebSocketManager extends Manager {
    static MessageTypes = {
        OPEN: `WebSocketManager.Open`,
        MESSAGE: `WebSocketManager.Message`,
        CLOSE: `WebSocketManager.Close`,
        ERROR: `WebSocketManager.Error`,
    };

    constructor(ws = null, { receive = null, parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this._ws = ws;

        //!DEBUGGING
        this._receive = this.receive;
    }

    connect({ uri = "localhost:3000", protocol = "ws" } = {}) {
        if(!this._ws) {
            this._ws = new WebSocket(`${ protocol }://${ uri }`);
        }

        this._ws.onopen = e => this.send(WebSocketManager.MessageTypes.OPEN, e);
        this._ws.onmessage = e => this.send(WebSocketManager.MessageTypes.MESSAGE, e);
        this._ws.onclose = e => this.send(WebSocketManager.MessageTypes.CLOSE, e);
        this._ws.onerror = e => this.send(WebSocketManager.MessageTypes.ERROR, e);

        return this;
    }

    disconnect() {
        if(this._ws) {
            this._ws.close();

            this.send(WebSocketManager.MessageTypes.CLOSE);
        }

        return 
    }

    //!DEBUGGING
    receive(msg) {
        if(Message.conforms(msg)) {
            console.log(msg);
        }

        return this;
    }
};