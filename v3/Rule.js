import Proposition from "./Proposition";
import Action from "./Action";

export default class Rule extends Proposition {
    constructor(msgOrValue, type, { node, state } = {}) {
        super(msgOrValue, type);

        this._action = new Action({ node, state });

        //! This is a precarious solution, as it relies on NOT having ANY SHARED PROPS between <Proposition> and <Action>
        return new Proxy(this, {
            get: function(target, key){
                if(target.hasOwnProperty(key)) {
                    return target[ key ];
                }

                return target;
            }
        });
    }

    then() {
        if(this.getResult() === true) {
            return this._action;
        }

        return this;
    }
};