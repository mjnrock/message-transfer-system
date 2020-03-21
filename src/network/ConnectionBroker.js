import WebSocketManager from "./WebSocketManager";
import Message from "./../Message";

export default class ConnectionBroker {
    constructor(parent, { isMaster = false } = {}) {
        this._parent = parent;

        this.state = {
            isMaster: isMaster,
            WebSocket: {}
        };
    }

    getWebSocket(indexOrUuid = 0) {
        if(typeof indexOrUuid === "number") {
            return Object.values(this.state.WebSocket)[ indexOrUuid ];
        } else {
            return this.state.WebSocket[ indexOrUuid ];
        }
    }

    createWebSocket({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = null } = {}) {
        let websocket = new WebSocketManager();

        if(ws) {
            websocket.create({ ws, isMaster: isMaster !== null ? isMaster : this.state.isMaster });
        } else {            
            websocket.create({ uri, protocol, isMaster: isMaster !== null ? isMaster : this.state.isMaster });
        }

        this._parent.register(websocket);
        this.state.WebSocket[ websocket.id ] = websocket;

        // //!DEBUGGING
        // console.log(Object.keys(this.state.WebSocket));
    }

    route(msg) {
        if(Message.conforms(msg) && msg._elevate) {
            let destination = msg._elevate;
            delete msg._elevate;

            if(destination === -1) {    // All
                for(let websocket of Object.values(this.state.WebSocket)) {
                    if(websocket.isReady()) {
                        websocket.wsmessage(msg);
                    }
                }
            } else if(this.state.WebSocket[ destination ] && this.state.WebSocket[ destination ].isReady()) {    // Targeted
                this.state.WebSocket[ destination ].wsmessage(msg);
            }
        }
    }
};