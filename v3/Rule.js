import Proposition from "./Proposition";
import Action from "./Action";

export default class Rule extends Proposition {
    constructor(msgOrValue, { type, node, state } = {}) {
        super(msgOrValue, type);

        this._action = new Action({ node, state });
    }

    if() {
        return this;
    }

    then() {
        this._action.result = this.getResult();

        return this._action;
    }

    static Process(msgOrValue, { type, node, state } = {}) {
        return new Rule(msgOrValue, type, { node, state });
    }
};