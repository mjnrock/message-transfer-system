import WebSocket from "ws";

import { GenerateUUID } from "./../helper";
import Manager from "./../Manager";
import Message from "./../Message";
import Packet from "./Packet";

export default class WebSocketManager extends Manager {
    static MessageTypes = {
        CLIENT_ID: `WebSocketManager.ClientId`,
        ACKNOWLEDGE: `WebSocketManager.Acknowledge`,
        OPEN: `WebSocketManager.Open`,
        MESSAGE: `WebSocketManager.Message`,
        CLOSE: `WebSocketManager.Close`,
        ERROR: `WebSocketManager.Error`,
    };
    //* The primary use of this function is for <Router>
    static AllMessageTypes() {
        return Object.values(WebSocketManager.MessageTypes);
    }

    constructor(ws = null, { parent = null, packager = null, isServerSide = false } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this.isServerSide = isServerSide;
        this._ws = ws;
        this._receive = this.receive;
        
        if(ws) {
            this.start();
        }
    }

    get signet() {
        return this.isServerSide ? `S:${ this.id }` : `C:${ this.id }`;
    }

    start({ ws = null, uri = "localhost:3000", protocol = "ws" } = {}) {
        if(ws) {
            this._ws = ws;
        }

        if(this.isServerSide) {        
            this._wssend(WebSocketManager.MessageTypes.CLIENT_ID, this.id);
        } else {
            if(!this._ws) {
                this._ws = new WebSocket(`${ protocol }://${ uri }`);
            }
    
            this._ws.onopen = e => this.send(WebSocketManager.MessageTypes.OPEN, e);
            this._ws.onclose = e => this.send(WebSocketManager.MessageTypes.CLOSE, e);
            this._ws.onerror = e => this.send(WebSocketManager.MessageTypes.ERROR, e);
        }

        this._ws.onmessage = e => {
            try {
                let msg = Packet.extractMessage(JSON.parse(e.data));

                if(msg !== false) {
                    this.message(msg);
                }
            } catch(e) {
                console.info(e);
            }
        };

        //!DEBUGGING
        if(this._ws) {
            console.log(`[${ this.signet }] running on ${ this.isServerSide ? "SERVER" : "CLIENT" }`);
        }

        return this;
    }
    end() {
        if(this._ws) {
            this._ws.close();

            this.send(WebSocketManager.MessageTypes.CLOSE);
        }

        return 
    }

    receive(msg) {
        //!DEBUGGING
        console.log(msg);

        if(!this.isServerSide) {
            if(msg.type === WebSocketManager.MessageTypes.CLIENT_ID) {
                this.id = msg.payload;  // This will force a mirroring of the UUID between the client and server version of the WSM
                this._wssend(WebSocketManager.MessageTypes.ACKNOWLEDGE, this.id);
            }
        }

        return this;
    }

    _wssend(type, payload) {
        let message = new Message(type, payload, this.signet);
        let packet = new Packet(message, this.signet, this.id);

        this._ws.send(packet.toJson());

        return this;
    }
    _wsmessage(msg) {
        if(Message.conforms(msg)) {
            let packet = new Packet(msg, this.signet, this.id);

            this._ws.send(packet.toJson());
        }

        return this;
    }
};