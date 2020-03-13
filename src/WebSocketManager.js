import WebSocket from "ws";

import { GenerateUUID } from "./helper";
import Manager from "./Manager";
import Message from "./Message";

export default class WebSocketManager extends Manager {
    static MessageTypes = {
        CONNECT: `WebSocketManager.Connect`,
        MESSAGE: `WebSocketManager.Message`,
        DISCONNECT: `WebSocketManager.Disconnect`,
        ERROR: `WebSocketManager.Error`,
    };

    constructor({ parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this._receive = this.receive;
        this._ws = null;
    }

    connect(uri, { protocol = "wss" } = {}) {
        this._ws = new WebSocket(`${ protocol }://${ uri }`);

        this._ws.onopen = e => {
            this.receive(this.packager(
                WebSocketManager.MessageTypes.CONNECT,
                e,
                this.signet
            ));

            this._ws.send("I have connected on the client!");
        };
        this._ws.onmessage = e => {
            this.receive(this.packager(
                WebSocketManager.MessageTypes.MESSAGE,
                e,
                this.signet
            ));
        };
        this._ws.onclose = e => {
            this.receive(this.packager(
                WebSocketManager.MessageTypes.DISCONNECT,
                e,
                this.signet
            ));
        };
        this._ws.onerror = e => {
            this.receive(this.packager(
                WebSocketManager.MessageTypes.ERROR,
                e,
                this.signet
            ));
        };

        return this;
    }


    receive(msg) {
        if(Message.conforms(msg)) {
            console.log(msg);
        }

        return this;
    }
};