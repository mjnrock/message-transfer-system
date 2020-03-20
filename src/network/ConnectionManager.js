import WebSocketManager from "./WebSocketManager";
import Message from "../Message";

export default class ConnectionManager {
    constructor(parent, { ws = null, isMaster = false } = {}) {
        this._parent = parent;

        this.WebSocket = new WebSocketManager(ws, { parent, isMaster });
        // this.WebRTC = new WebRTCManager();

        this._parent.register(this.WebSocket);
    }

    route(msg) {
        if(Message.conforms(msg) && msg._elevate === true) {
            delete msg._elevate;

            if(this.WebSocket.isReady()) {
                this.WebSocket.wsmessage(msg);
            }
        }
    }
};