import { GenerateUUID } from "../helper";
import Manager from "../Manager";
import Packet from "../Packet";
import Message from "../Message";

export default class WebSocketManager extends Manager {
    static MessageTypes = {
        CLIENT_ID: `WebSocketManager.ClientId`,
    };

    //? This is a one-to-one wrapper for 
    constructor(wsClient, { receive = null, parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this._ws = wsClient;
        this._ws.on("message", packet => {
            if(Packet.conforms(packet)) {
                let msg = Packet.extractMessage(packet);

                if(Message.conforms(msg)) {
                    this.message(msg);
                }
            }
        });
        
        this.ClientId = GenerateUUID();
        this._ws.ClientId = this.ClientId;
        this._ws.send(WebSocketManager.MessageTypes.CLIENT_ID, this._ws.CLIENT_ID); // Send the UUID to the client
    }
};