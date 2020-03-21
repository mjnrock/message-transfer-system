import WebSocket from "ws";

import { GenerateUUID } from "./../helper";
import Manager from "./../Manager";
import Message from "./../Message";
import Packet from "./Packet";

export default class WebSocketManager extends Manager {
    static SignalTypes = {
        CLIENT_ID: `WebSocketManager.ClientId`,
        ACKNOWLEDGE: `WebSocketManager.Acknowledge`,
        OPEN: `WebSocketManager.Open`,
        MESSAGE: `WebSocketManager.Message`,
        MESSAGE_ERROR: `WebSocketManager.MessageError`,
        CLOSE: `WebSocketManager.Close`,
        ERROR: `WebSocketManager.Error`,
    };
    //* The primary use of this function is for <Router>
    static AllSignalTypes() {
        return Object.values(WebSocketManager.SignalTypes);
    }

    constructor(ws = null, { receive = null, parent = null, packager = null, isMaster = false } = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this._ws = ws;
        this.isMaster = isMaster;
        
        if(ws) {
            this.create();
        }
    }

    isReady() {
        return this._ws && this._ws.readyState === 1;
    }

    get signet() {
        return this.isMaster ? `S:${ this.id }` : `C:${ this.id }`;
    }

    create({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = false } = {}) {
        if(ws) {
            this._ws = ws;
        }
        if(isMaster) {
            this.isMaster = true;
        }
        
        if(!this._ws) {
            this._ws = new WebSocket(`${ protocol }://${ uri }`);
        }

        this._ws.onopen = this._onWsOpen.bind(this);
        this._ws.onclose = this._onWsClose.bind(this);
        this._ws.onerror = this._onWsError.bind(this);
        this._ws.onmessage = this._onWsMessage.bind(this);

        if(this.isMaster) {
            //* Send the initialization message to the client containing the client's assigned ID (it is the same as @this.id)
            this.wsmessage(new Message(
                WebSocketManager.SignalTypes.CLIENT_ID,
                this.id,
                this.signet
            ));
        }

        //!DEBUGGING
        if(this._ws) {
            console.log(`[${ this.signet }] running as [${ this.isMaster ? "Master" : "Slave" }]`);
        }

        return this;
    }
    destroy() {
        if(this._ws) {
            this._ws.close();

            this.send(WebSocketManager.SignalTypes.CLOSE, this.id);
        }
    }

    /* The WSM can send to its counterpart in 1 of 4 ways:
    *   1) [DEFAULT] By receiving a <Message> to its .receive(<Message>) | This is called via a subscription or through the MTS.<Router> setup
    *   2) By .wssend(type, payload)
    *   3) By .wsmessage(<Message>)
    *   4) By .wspacket(<Packet>)
    */
    receive(msg) {
        if(Message.conforms(msg) && msg.type === WebSocketManager.SignalTypes.MESSAGE) {
            this.wsmessage(msg.payload);
        }
    }
    wssend(type, payload) {
        let msg = new Message(type, payload, this.signet);
        
        this.wsmessage(msg);
    }
    wsmessage(msg) {
        let packet = new Packet(msg, this.signet, this.id);

        this._ws.send(packet.toJson());
    }
    wspacket(packet) {
        if(Packet.conforms(packet)) {
            this._ws.send(packet.toJson());
        }
    }

    /**
     * A helper function for use within the MTS.<Router> system to flag a message to be sent through the network
     * @param {<Message>} message
     * @returns <Message> { type: WebSocketManager.SignalTypes.MESSAGE, payload: @message }
     */
    static Wrap(message) {
        return new Message(
            WebSocketManager.SignalTypes.MESSAGE,
            message
        );
    }

    _onWsMessage(e) {
        try {
            let msg = Packet.extractMessage(e.data);

            if(msg !== false) {
                //!DEBUGGING
                console.log(`|${ this.id }|${ msg.timestamp }|: Received [${ msg.type }] from [${ msg.source }]`);

                if(msg.type === WebSocketManager.SignalTypes.CLIENT_ID && !this.isMaster) {
                    //!DEBUGGING
                    let oldId = this.id;
                    console.log(`[${ oldId }] reassigned to [${ msg.payload }]`);
                    
                    this.id = msg.payload;
                } else {
                    this.message(msg);
                }
            }
        } catch(e) {
            this._onWsMessageError(e);
        }
    }
    _onWsMessageError(e) {
        this.send(WebSocketManager.SignalTypes.MESSAGE_ERROR, e);
    }
    _onWsOpen(e) {    
        this.send(WebSocketManager.SignalTypes.OPEN, e);
    }
    _onWsClose(e) {
        this.send(WebSocketManager.SignalTypes.CLOSE, e);
    }
    _onWsError(e) {
        this.send(WebSocketManager.SignalTypes.ERROR, e);
    }
};