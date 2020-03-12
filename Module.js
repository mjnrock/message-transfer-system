export default class Module {
    constructor(name) {
        this.id = Symbol(name);
        this.name = name;

        this._mts = null;
    }

    send(msg) {
        //TODO this._mts...(msg);
    }
    receive(msg) {}
}