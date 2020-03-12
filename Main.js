import Message from "./Message";
import Packet from "./Packet";
import MessageBus from "./MessageBus";
import PacketBus from "./PacketBus";
import Module from "./Module";
import ModuleRegistry from "./ModuleRegistry";

export function create() {
    let MTS = new Module("MTS");

    MTS.Bus = {};
    MTS.Bus.Message = new MessageBus(MTS);
    MTS.Bus.Packet = new PacketBus(MTS);

    MTS.Registry = new ModuleRegistry(MTS);

    return MTS;
}

export default {
    Message,
    Packet,
    MessageBus,
    PacketBus,
    Module,
    ModuleRegistry,

    create
};