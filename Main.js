import Event from "./Event";
import Message from "./Message";
import Packet from "./Packet";
import MessageBus from "./MessageBus";
import PacketBus from "./PacketBus";
import Module from "./Module";
import ModuleRegistry from "./ModuleRegistry";

export function create(next) {
    let MTS = new Module("MTS", next);
    delete MTS._mts;

    MTS.Bus = {};
    MTS.Bus.Message = new MessageBus(MTS);
    MTS.Bus.Packet = new PacketBus(MTS);

    MTS.Registry = new ModuleRegistry(MTS);
    MTS.Registry.modules[ MTS.name ] = MTS;     // Purposefully avoids subscriptions, only load the MTS into registry for the purpose of a .lookup()

    return MTS;
}

export default {
    Event,
    Message,
    Packet,
    MessageBus,
    PacketBus,
    Module,
    ModuleRegistry,

    create
};