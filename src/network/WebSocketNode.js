import { GenerateUUID } from "./../helper";
import Node from "./../Node";
import Message from "./../Message";
import Packet from "./Packet";

export default class WebSocketNode extends Node {
    static SignalTypes = {
        CLIENT_ID: `WebSocketNode.ClientId`,
        ACKNOWLEDGE: `WebSocketNode.Acknowledge`,
        OPEN: `WebSocketNode.Open`,
        MESSAGE: `WebSocketNode.Message`,
        MESSAGE_ERROR: `WebSocketNode.MessageError`,
        CLOSE: `WebSocketNode.Close`,
        ERROR: `WebSocketNode.Error`,
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(WebSocketNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, ws = null, receive = null, parent = null, packager = null, isMaster = false, onClose = null, onOpen = null } = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this.state = {
            isMaster: isMaster,
            WebSocket: ws,
            Hooks: {
                onOpen: onOpen,
                onClose: onClose
            }
        };
        
        if(ws) {
            this.create();
        }
    }

    getSocket() {
        return this.state.WebSocket;
    }
    getAddress() {
        let obj = this.getSocket()._socket.address();

        return {
            id: this.id,
            ...obj
        };
    }
    isReady() {
        return this.state.WebSocket && this.state.WebSocket.readyState === 1;
    }

    get signet() {
        return this.state.isMaster ? `S:${ this.id }` : `C:${ this.id }`;
    }

    create({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = false } = {}) {
        if(ws) {
            this.state.WebSocket = ws;
        }
        if(isMaster) {
            this.state.isMaster = true;
        }
        
        if(!this.state.WebSocket) {
            this.state.WebSocket = new (WebSocket || global.WebSocket)(`${ protocol }://${ uri }`);
            this.state.WebSocket.onopen = this._onWsOpen.bind(this);
        }

        this.state.WebSocket.onclose = this._onWsClose.bind(this);
        this.state.WebSocket.onerror = this._onWsError.bind(this);
        this.state.WebSocket.onmessage = this._onWsMessage.bind(this);

        if(this.state.isMaster) {
            //* Send the initialization message to the client containing the client's assigned ID (it is the same as @this.id)
            this.wsmessage(new Message(
                WebSocketNode.SignalTypes.CLIENT_ID,
                this.id,
                this.signet
            ));
        }

        //!DEBUGGING
        if(this.state.WebSocket) {
            console.log(`[${ this.signet }] running as [${ this.state.isMaster ? "Master" : "Slave" }]`);
        }

        return this;
    }
    destroy() {
        if(this.state.WebSocket) {
            this.state.WebSocket.close();

            this.send(WebSocketNode.SignalTypes.CLOSE, this.id);
        }
    }

    /* The WSM can send to its counterpart in 1 of 4 ways:
    *   1) [DEFAULT] By receiving a <Message> to its .receive(<Message>) | This is called via a subscription or through the MTS.<Router> setup
    *   2) By .wssend(type, payload)
    *   3) By .wsmessage(<Message>)
    *   4) By .wspacket(<Packet>)
    */
    receive(msg) {
        if(Message.conforms(msg) && msg.type === WebSocketNode.SignalTypes.MESSAGE) {
            this.wsmessage(msg.payload);
        }
    }
    wssend(type, payload) {
        let msg = new Message(type, payload, this.signet);
        
        this.wsmessage(msg);
    }
    wsmessage(msg) {
        let packet = new Packet(msg, this.signet, this.id);

        this.wspacket(packet);
    }
    wspacket(packet) {
        try {
            if(Packet.conforms(packet)) {
                this.state.WebSocket.send(packet.toJson());
            }
        } catch(e) {
            this.send(WebSocketNode.SignalTypes.ERROR, e);
        }
    }

    _onWsMessage(e) {
        try {
            let msg = Packet.extractMessage(e.data);

            if(msg !== false) {
                //!DEBUGGING
                console.log(`|${ this.id }|${ msg.timestamp }|: Received [${ msg.type }] from [${ msg.source }]`);

                if(msg.type === WebSocketNode.SignalTypes.CLIENT_ID && !this.state.isMaster) {
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
        this.send(WebSocketNode.SignalTypes.MESSAGE_ERROR, e.message);
    }
    _onWsOpen(e) {
        console.log("OPEN");
        this.send(WebSocketNode.SignalTypes.OPEN, e);

        if(typeof this.state.Hooks.onOpen === "function") {
            this.state.Hooks.onOpen(this, e);
        }
    }
    _onWsClose(e) {
        this.send(WebSocketNode.SignalTypes.CLOSE, e);

        if(typeof this.state.Hooks.onClose === "function") {
            this.state.Hooks.onClose(this, e);
        }
    }
    _onWsError(e) {
        this.send(WebSocketNode.SignalTypes.ERROR, e);
    }
};