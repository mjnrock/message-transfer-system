import Module from "./Module";

export default class ModuleRegistry {
    constructor(mts, modules = []) {
        this._mts = mts;
        this.Modules = {};

        modules.forEach(mod => this.register(mod));
    }

    register(module) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        module._mts = this._mts;
        this.Modules[ module.name ] = module;

        return this;
    }
    unregister(module) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        delete this.Modules[ module.name ];

        return this;
    }
}