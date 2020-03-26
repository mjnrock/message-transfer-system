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

        this.internal = {
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
        return this.internal.WebSocket;
    }
    getAddress() {
        let obj = this.getSocket()._socket.address();

        return {
            id: this.id,
            ...obj
        };
    }
    isReady() {
        return this.internal.WebSocket && this.internal.WebSocket.readyState === 1;
    }

    get signet() {
        return this.internal.isMaster ? `S:${ this.id }` : `C:${ this.id }`;
    }

    create({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = false } = {}) {
        if(ws) {
            this.internal.WebSocket = ws;
        }
        if(isMaster) {
            this.internal.isMaster = true;
        }
        
        if(!this.internal.WebSocket) {
            this.internal.WebSocket = new (WebSocket || global.WebSocket)(`${ protocol }://${ uri }`);
            this.internal.WebSocket.onopen = this._onWsOpen.bind(this);
        }

        this.internal.WebSocket.onclose = this._onWsClose.bind(this);
        this.internal.WebSocket.onerror = this._onWsError.bind(this);
        this.internal.WebSocket.onmessage = this._onWsMessage.bind(this);

        if(this.internal.isMaster) {
            //* Send the initialization message to the client containing the client's assigned ID (it is the same as @this.id)
            this.wsmessage(new Message(
                WebSocketNode.SignalTypes.CLIENT_ID,
                this.id,
                this.signet
            ));
        }

        //!DEBUGGING
        if(this.internal.WebSocket) {
            console.log(`[${ this.signet }] running as [${ this.internal.isMaster ? "Master" : "Slave" }]`);
        }

        return this;
    }
    destroy() {
        if(this.internal.WebSocket) {
            this.internal.WebSocket.close();

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
                this.internal.WebSocket.send(packet.toJson());
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

                if(msg.type === WebSocketNode.SignalTypes.CLIENT_ID && !this.internal.isMaster) {
                    //!DEBUGGING
                    let oldId = this.id;
                    console.log(`[${ oldId }] reassigned to [${ msg.payload }]`);

                    const parent = this._parent;
                    parent.unregister(this);                    
                    this.id = msg.payload;
                    parent.register(this);
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
        this.send(WebSocketNode.SignalTypes.OPEN, e);

        if(typeof this.internal.Hooks.onOpen === "function") {
            this.internal.Hooks.onOpen(this, e);
        }
    }
    _onWsClose(e) {
        let payload = e;
        if(Array.isArray(WebSocketNode.CloseCode[ e.code ])) {
            payload = WebSocketNode.CloseCode[ e.code ];
        }
        
        this.send(WebSocketNode.SignalTypes.CLOSE, payload);

        if(typeof this.internal.Hooks.onClose === "function") {
            this.internal.Hooks.onClose(this, payload);
        }
    }
    _onWsError(e) {
        this.send(WebSocketNode.SignalTypes.ERROR, e);
    }

    static CloseCode = {
        1000: [ 1000, "CLOSE_NORMAL", "Successful operation / regular socket shutdown" ],
        1001: [ 1001, "CLOSE_GOING_AWAY", "Client is leaving (browser tab closing)" ],
        1002: [ 1002, "CLOSE_PROTOCOL_ERROR", "Endpoint received a malformed frame" ],
        1003: [ 1003, "CLOSE_UNSUPPORTED", "Endpoint received an unsupported frame (e.g. binary-only endpoint received text frame)" ],
        1005: [ 1005, "CLOSED_NO_STATUS", "Expected close status, received none" ],
        1006: [ 1006, "CLOSE_ABNORMAL", "No close code frame has been receieved" ],
        1007: [ 1007, "UNSUPPORTED PAYLOAD", "Endpoint received inconsistent message (e.g. malformed UTF-8)" ],
        1008: [ 1008, "POLICY VIOLATION", "Generic code used for situations other than 1003 and 1009" ],
        1009: [ 1009, "CLOSE_TOO_LARGE", "Endpoint won't process large frame" ],
        1010: [ 1010, "MANDATORY EXTENSION", "Client wanted an extension which server did not negotiate" ],
        1011: [ 1011, "SERVER ERROR", "Internal server error while operating" ],
        1012: [ 1012, "SERVICE RESTART", "Server/service is restarting" ],
        1013: [ 1013, "TRY AGAIN LATER", "Temporary server condition forced blocking client's request" ],
        1014: [ 1014, "BAD GATEWAY", "Server acting as gateway received an invalid response" ],
        1015: [ 1015, "TLS HANDSHAKE FAILURE", "Transport Layer Security handshake failure" ],
    };
};