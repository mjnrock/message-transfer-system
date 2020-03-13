import { GenerateUUID } from "../helper";
import Manager from "../Manager";

import DestinationWebSocket from "./DestinationWebSocket";

export default class PacketManager extends Manager {
    constructor(parent, packager) {
        super(GenerateUUID(), {
            receive: this.receive,
            parent: parent,
            packager: packager
        });
    }

    receive(type, msg, destination) {
        if(destination instanceof DestinationWebSocket) {
            
        }
    }
};