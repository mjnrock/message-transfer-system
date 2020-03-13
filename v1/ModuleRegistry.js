import Module from "./Module";

export default class ModuleRegistry {
    constructor(mts, modules = []) {
        this._mts = mts;
        this.modules = {};

        modules.forEach(mod => this.register(mod));
    }

    lookup(uuid) {
        console.log(uuid, this.modules)
        return Object.values(this.modules).filter(m => m.uuid === uuid)[ 0 ];
    }
    get(name) {
        return this.modules[ name ];
    }

    register(module, { subMessageBus = false, subPacketBus = false, twoWay = false } = {}) {
        if(!(module instanceof Module)) {
            throw new Error("@module does not extends <Module>");
        }

        
        if(subMessageBus) {
            module.subscribe(this._mts.Bus.Message);
        }
        if(subPacketBus) {
            module.subscribe(this._mts.Bus.Packet);
        }

        if(twoWay) {
            this._mts.subscribe(module);
        }
        module.subscribe(this._mts);
        module._mts = this._mts;
        this.modules[ module.name ] = module;

        return this;
    }
    unregister(module) {
        if(!(module instanceof Module)) {
            throw new Error("@module does not extends <Module>");
        }

        this._mts.unsubscribe(module);
        module.unsubscribe(this._mts);
        module.unsubscribe(this._mts.Bus.Message);
        module.unsubscribe(this._mts.Bus.Packet);
        module._mts = null;
        delete this.modules[ module.name ];

        return this;
    }
}