import Module from "./Module";

export default class ModuleRegistry {
    constructor(mts, modules = []) {
        this._mts = mts;
        this.modules = {};

        modules.forEach(mod => this.register(mod));
    }

    get(name) {
        return this.modules[ name ];
    }

    register(module, { subMessageBus = false, subPacketBus = false } = {}) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        
        if(subMessageBus) {
            module.subscribe(this._mts.Bus.Message);
        }
        if(subPacketBus) {
            module.subscribe(this._mts.Bus.Packet);
        }

        module.subscribe(this._mts);
        module._mts = this._mts;
        this.modules[ module.name ] = module;

        return this;
    }
    unregister(module) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        module.unsubscribe(this._mts);
        module.unsubscribe(this._mts.Bus.Message);
        module.unsubscribe(this._mts.Bus.Packet);
        module._mts = null;
        delete this.modules[ module.name ];

        return this;
    }
}