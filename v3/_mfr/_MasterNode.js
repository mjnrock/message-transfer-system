import Registry from "../Registry";

export default class MasterNode extends Node {
    constructor({ name, receive } = {}) {
        super({ name, receive });

        this._channels = [
            new Chan
        ]

        this.Registry = new Registry();
    }

    register(...nodes) {
        this.Registry.register(...nodes);
        this.Feed.subscribe(...nodes);
    }
    unregister(...nodes) {
        this.Registry.unregister(...nodes);
        this.Feed.unsubscribe(...nodes);
    }
};