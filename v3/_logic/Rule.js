import Condition from "./Condition";
import Action from "./Action";

export default class Rule extends Condition {
    constructor(msgOrValue, { type, node, state } = {}) {
        super(msgOrValue, type);

        this._action = new Action({ node, state });
    }

    get if() {
        return this;
    }
    get then() {
        this._action._result = this.getResult;
        this._action.__reverter = this;

        return this._action;
    }

    static Process(msgOrValue, { type, node, state } = {}) {
        return new Rule(msgOrValue, { type, node, state });
    }
};