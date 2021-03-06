import WebSocketNode from "./WebSocketNode";
import Node from "./../Node";
import Message from "./../Message";
import { GenerateUUID } from "./../helper";

export default class ConnectionBroker extends Node {
    constructor(mnode, { name = null, isMaster = false } = {}) {
        super(name || GenerateUUID(), {
            mnode: mnode
        });

        this.internal = {
            isMaster: isMaster,
            WebSocket: {}
        };
    }

    /**
     * Broadcast the message to all connections.  The sole purpose of this `.receive(msg)` is to act as a network-level relayer for messages.
     * @param {Message} msg 
     */
    receive(msg) {
        if(Message.conforms(msg)) {    // Only relay messages that have a Registry entry
            msg.elevate(true);  // Will always send to ALL connections
            this.message(msg);
        }
    }

    getWsAddressMap(idAsKey = true) {
        let map = {};

        for(let wsn of Object.values(this.internal.WebSocket)) {
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
            return Object.values(this.internal.WebSocket)[ indexOrUuid ];
        } else if(typeof indexOrUuid === "string" || indexOrUuid instanceof String) {
            return this.internal.WebSocket[ indexOrUuid ];
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

    webSocketNode({ ws = null, uri = "localhost:3000", protocol = "ws", isMaster = null, onClose = null } = {}) {
        let websocket = new WebSocketNode({
            onClose: (wsn, e) => {
                if(typeof onClose === "function") {
                    onClose(wsn);
                }

                delete this.internal.WebSocket[ wsn.id ];
                wsn._mnode.unregister(websocket);
            }
        });

        if(ws) {
            websocket.create({ ws, isMaster: isMaster !== null ? isMaster : this.internal.isMaster });
        } else {            
            websocket.create({ uri, protocol, isMaster: isMaster !== null ? isMaster : this.internal.isMaster });
        }

        this._mnode.register(websocket);
        this.internal.WebSocket[ websocket.id ] = websocket;
        this._mnode.Router.addRoute(websocket, WebSocketNode.AllSignalTypes());

        return websocket.id;
    }

    broadcast(msg) {
        for(let websocket of Object.values(this.internal.WebSocket)) {
            if(websocket.isReady()) {
                msg.source = websocket.signet;
                websocket.wsmessage(msg);
            }
        }
    }

    route(msg) {
        if(Message.conforms(msg) && msg._elevate) {
            let destination = msg._elevate;
            delete msg._elevate;

            if(destination === true) {    // All
                this.broadcast(msg);
            } else if(this.internal.WebSocket[ destination ] && this.internal.WebSocket[ destination ].isReady()) {    // Targeted
                msg.source = this.internal.WebSocket[ destination ].signet;
                this.internal.WebSocket[ destination ].wsmessage(msg);
            }
        }
    }
};