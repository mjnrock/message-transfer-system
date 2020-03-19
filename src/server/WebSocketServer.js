import { GenerateUUID } from "./../helper";
import Manager from "./../Manager";
import Packet from "./../Packet";
import Message from "./../Message";

export default class WebSocketServer extends Manager {
    constructor(wss, { receive = null, parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this._wss = wss;

        this._wss.on("message", packet => {
            if(Packet.conforms(packet)) {
                let msg = Packet.extractMessage(packet);

                if(Message.conforms(msg)) {
                    this.message(msg);
                }
            }
        });
    }
};