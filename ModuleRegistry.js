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

    register(module) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        module._mts = this._mts;
        this.modules[ module.name ] = module;

        return this;
    }
    unregister(module) {
        if(module instanceof Module) {
            throw new Error("@module does not extends <Module>");
        }

        module._mts = null;
        delete this.modules[ module.name ];

        return this;
    }
}