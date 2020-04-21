import { GenerateUUID } from "./../helper";
import Node from "./../Node";
import Message from "./../Message";
import Packet from "./Packet";

export default class WebSocketNode extends Node {
    static SignalTypes = {
        CLIENT_ID: `WebSocketNode.ClientId`,
        ACKNOWLEDGE: `WebSocketNode.Acknowledge`,
        OPEN: `WebSocketNode.Open`,
        MESSAGE: `WebSocketNode`,
        MESSAGE_ERROR: `WebSocketNodeError`,
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

    constructor({ name, ws, receive, isPublic, onClose, onOpen } = {}) {
        super({
            name: name || GenerateUUID(),
            receive,
            isPublic
        });

        this._hooks.onOpen = onOpen;
        this._hooks.onClose = onClose;
        
        this.supply = {
            WebSocket: ws,
        };
        
        if(ws) {
            this.create();
        }
    }

    get ws() {
        return this.supply.WebSocket;
    }

    getSocket() {
        return this.ws;
    }
    getAddress() {
        let obj = this.getSocket()._socket.address();

        return {
            id: this.id,
            ...obj
        };
    }
    isReady() {
        return this.ws && this.ws.readyState === 1;
    }

    get signet() {
        return this.id;
    }

    create({ ws = null, uri = "localhost:3000", protocol = "ws", type = "json" } = {}) {
        if(ws) {
            this.ws = ws;
        }

        this.ws.binaryType = type;
        
        if(!this.ws) {
            this.ws = new (WebSocket || global.WebSocket)(`${ protocol }://${ uri }`);
            this.ws.onopen = this._onWsOpen.bind(this);
        }

        this.ws.onerror = this._onWsError.bind(this);
        this.ws.onclose = this._onWsClose.bind(this);
        this.ws.onmessage = this._onWsMessage.bind(this);

        return this;
    }
    destroy() {
        if(this.ws) {
            this.ws.close();

            this.emit(WebSocketNode.SignalTypes.CLOSE, this.id);
        }
    }

    wssend(type, payload) {
        let msg = new Message(type, payload, this.signet);
        
        this.ws.send(msg.toJson());
    }

    _onWsMessage(e) {
        try {
            //TODO  What to do when the data comes in: should account for JSON and BUFFER
        } catch(e) {
            this._onWsMessageError(e);
        }
    }
    _onWsMessageError(e) {
        this.emit(WebSocketNode.SignalTypes.MESSAGE_ERROR, e);
    }
    _onWsOpen(e) {
        this.emit(WebSocketNode.SignalTypes.OPEN, e);

        if(typeof this._hooks.onOpen === "function") {
            this._hooks.onOpen(this, e);
        }
    }
    _onWsClose(e) {
        let payload = e;
        if(Array.isArray(WebSocketNode.CloseCode[ e.code ])) {
            payload = WebSocketNode.CloseCode[ e.code ];
        }
        
        this.emit(WebSocketNode.SignalTypes.CLOSE, payload);

        if(typeof this._hooks.onClose === "function") {
            this._hooks.onClose(this, payload);
        }
    }
    _onWsError(e) {
        this.emit(WebSocketNode.SignalTypes.ERROR, e);
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