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

    constructor({ parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this._receive = this.receive;
        this._ws = null;
    }

    //! DEBUGGING ONLY
    send(...args) {
        this.receive(...args);
    }

    connect(uri, { protocol = "ws" } = {}) {
        this._ws = new WebSocket(`${ protocol }://${ uri }`);

        this._ws.onopen = e => {
            this.send(this.packager(
                WebSocketManager.MessageTypes.OPEN,
                e,
                this.signet
            ));

            this._ws.send("I have connected on the client!");
        };
        this._ws.onmessage = e => {
            this.send(this.packager(
                WebSocketManager.MessageTypes.MESSAGE,
                e,
                this.signet
            ));
        };
        this._ws.onclose = e => {
            this.send(this.packager(
                WebSocketManager.MessageTypes.CLOSE,
                e,
                this.signet
            ));
        };
        this._ws.onerror = e => {
            this.send(this.packager(
                WebSocketManager.MessageTypes.ERROR,
                e,
                this.signet
            ));
        };

        return this;
    }

    disconnect() {
        if(this._ws) {
            this._ws.close();

            this.send(this.packager(
                WebSocketManager.MessageTypes.CLOSE,
                null,
                this.signet
            ));
        }

        return 
    }


    receive(msg) {
        if(Message.conforms(msg)) {
            console.log(msg);
        }

        return this;
    }
};