import Node from "../Node";
import Rule from "./Rule";

export default class Action {
    constructor({ node, state = {}, signal = null, result = true } = {}) {
        this._node = node;
        this._state = state;
        this._signal = signal;

        this._result = result;
        this.__reverter = this;
    }

    get elseif() {
        return new Rule (
            this.__reverter._signal || this.__reverter._value,
            {
                type: this.__reverter._scope.type,
                node: this.__reverter._action._node,
                state: this.__reverter._action._state,
            }
        );
    }

    get result() {
        return this._result;
    }
    set result(result) {
        this._result = result;
    }

    _getDefaultArgs() {
        return {
            node: this._node,
            state: this._state,
            
            isNode: this._node instanceof Node,
        };
    }

    node(node) {
        this._node = node;

        return this;
    }

    //* ACTION METHODS
    run(method, ...args) {
        if(!this.result) {
            return this;
        }

        if(this._node instanceof Node && typeof this._node[ method ] === "function") {
            this._node[ method ](this._getDefaultArgs(), ...args);
        } else if(typeof method === "function") {
            method(this._getDefaultArgs(), ...args);
        }

        return this;
    }

    prop(propsObj = {}) {
        if(!this.result) {
            return this;
        }

        if(typeof propsObj === "object" && Object.keys(propsObj).length) {
            let scope = this._state;

            if(this._node instanceof Node) {
                scope = this._node.state;
            }

            Object.entries(propsObj).forEach(([ key, value]) => {
                //! Untested, but intended to allow for dot notation (e.g. "propA.propAA.propAAA")
                //? Test to verify if something like "prop.2" works when scope[ prop ] is an Array
                if(key.includes(".")) {
                    let keys = key.split("."),
                        res = scope;
        
                    for(let p of keys) {
                        if(res[ p ] !== void 0) {
                            res = res[ p ];
                        }
                    }
        
                    res = value;
                } else {
                    scope[ key ] = value;
                }
            });
        }

        return this;
    }
    state(stateObj) {
        if(!this.result) {
            return this;
        }
        
        if(typeof stateObj === "object") {
            if(this._node instanceof Node) {
                this._node.state = stateObj;
            } else {
                this._state = stateObj;
            }
        }

        return this;
    }

    emit(type, payload, { shape, destination } = {}) {
        if(!this.result) {
            return this;
        }
        
        if(this._node instanceof Node) {
            this._node.emit(type, payload, { shape, destination });
        }

        return this;
    }

    route(...nodes) {
        if(!this.result) {
            return this;
        }
        
        nodes.push(this._node);
        for(let node of nodes) {
            if(this._node instanceof Node) {
                node.receive(this._signal);
            }
        }

        return this;
    }


    //* TERMINAL METHODS
    /**
     * Default terminal function.  If attached, returns the Node's state, otherwise returns `this._state`.
     */
    get done() {
        if(this._node instanceof Node) {
            return this._node.state;
        }

        return this._state;
    }
    get getState() {
        return this._state;
    }
    get getNode() {
        return this._node;
    }
};