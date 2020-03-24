import WebSocketNode from "./WebSocketNode";
import Node from "./../Node";
import Message from "./../Message";
import { GenerateUUID } from "../helper";

export default class ConnectionBroker extends Node {
    constructor(parent, { name = null, isMaster = false } = {}) {
        super(name || GenerateUUID(), {
            parent: parent
        });

        this.state = {
            isMaster: isMaster,
            WebSocket: {}
        };
    }

    /**
     * Broadcast the message to all connections.  The sole purpose of this `.receive(msg)` is to act as a network-level relayer for messages.
     * @param {Message} msg 
     */
    receive(msg) {
        if(Message.conforms(msg)) {
            msg.elevate(-1);  // Will always send to ALL connections
            this.message(msg);
        }
    }

    getWsAddressMap(idAsKey = true) {
        let map = {};

        for(let wsn of Object.values(this.state.WebSocket)) {
            if(idAsKey) {
                map[ wsn.id ] = wsn.getAddress();
            } else {
                let address = wsn.getAddress();

                map[ address.address ] = address;
            }
        }

        return map;
    }
    getWebSocketNode(indexOrUuid = 0) {
        if(typeof indexOrUuid === "number") {
            return Object.values(this.state.WebSocket)[ indexOrUuid ];
        } else if(typeof indexOrUuid === "string" || indexOrUuid instanceof String) {
            return this.state.WebSocket[ indexOrUuid ];
        }

        return false;
    }
    getSocket(indexOrUuid = 0) {
        let wsn = this.getWebSocketNode(indexOrUuid);

        if(wsn instanceof WebSocketNode) {
            return wsn.getSocket();
        }

        return false;
    }

    createWebSocket({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = null } = {}) {
        let websocket = new WebSocketNode({
            onClose: (wsn, e) => {                
                delete this.state.WebSocket[ wsn.id ];
                wsn._parent.unregister(websocket);
            }
        });

        if(ws) {
            websocket.create({ ws, isMaster: isMaster !== null ? isMaster : this.state.isMaster });
        } else {            
            websocket.create({ uri, protocol, isMaster: isMaster !== null ? isMaster : this.state.isMaster });
        }

        this._parent.register(websocket);
        this.state.WebSocket[ websocket.id ] = websocket;
        this._parent.Router.addRoute(websocket, WebSocketNode.AllSignalTypes());

        return websocket.id;
    }

    route(msg) {
        if(Message.conforms(msg) && msg._elevate) {
            let destination = msg._elevate;
            delete msg._elevate;

            if(destination === -1) {    // All
                for(let websocket of Object.values(this.state.WebSocket)) {
                    if(websocket.isReady()) {
                        msg.source = websocket.signet;
                        websocket.wsmessage(msg);
                    }
                }
            } else if(this.state.WebSocket[ destination ] && this.state.WebSocket[ destination ].isReady()) {    // Targeted
                msg.source = websocket.signet;
                this.state.WebSocket[ destination ].wsmessage(msg);
            }
        }
    }
};