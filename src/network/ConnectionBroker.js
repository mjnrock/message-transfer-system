import WebSocketManager from "./WebSocketManager";
import Message from "../Message";

export default class ConnectionBroker {
    constructor(parent, { isMaster = false } = {}) {
        this._parent = parent;
        this.isMaster = isMaster;

        this.WebSocket = {};

        this._parent.register(this.WebSocket);
    }

    getWebSocket(indexOrUuid = 0) {
        if(typeof indexOrUuid === "number") {
            return Object.values(this.WebSocket)[ indexOrUuid ];
        } else {
            return this.WebSocket[ indexOrUuid ];
        }
    }

    createWebSocket({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = null } = {}) {
        let websocket = new WebSocketManager();

        if(ws) {
            websocket.create({ ws, isMaster: isMaster !== null ? isMaster : this.isMaster });
        } else {            
            websocket.create({ uri, protocol, isMaster: isMaster !== null ? isMaster : this.isMaster });
        }

        this._parent.register(websocket);
        this.WebSocket[ websocket.id ] = websocket;

        // //!DEBUGGING
        // console.log(Object.keys(this.WebSocket));
    }

    route(msg) {
        if(Message.conforms(msg) && msg._elevate) {
            let destination = msg._elevate;
            delete msg._elevate;

            if(destination === -1) {    // All
                for(let websocket of Object.values(this.WebSocket)) {
                    if(websocket.isReady()) {
                        websocket.wsmessage(msg);
                    }
                }
            } else if(this.WebSocket[ destination ] && this.WebSocket[ destination ].isReady()) {    // Targeted
                this.WebSocket[ destination ].wsmessage(msg);
            }
        }
    }
};