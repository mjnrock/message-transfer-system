import Condition from "./Condition";
import Action from "./Action";

export default class Rule extends Condition {
    constructor(signalOrValue, { type, node, state } = {}) {
        super(signalOrValue, type);

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

    static Process(signalOrValue, { type, node, state } = {}) {
        return new Rule(signalOrValue, { type, node, state });
    }
};