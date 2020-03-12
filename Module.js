export default class Module {
    constructor(name) {
        this.id = Symbol(name);
        this.name = name;

        this._mts = null;
    }

    send(msg) {
        this._mts.Bus.Message.enqueue(msg);

        return this;
    }
    receive(msg) {}
}