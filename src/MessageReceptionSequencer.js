import Message from "./Message";
import Node from "./Node";
import Main from "./Main";

export default class MessageReceptionSequencer {
    constructor(msg, { scope = null, parent = null } = {}) {
        this.Message = msg;

        this.Scope = scope;
        this.Parent = parent;
        
        this.State = {};

        if(Message.conforms(msg)) {
            this._shouldShouldCircuit = false;
        } else {
            this._shouldShouldCircuit = true;
        }
    }

    _forceShortCircuit() {
        this._shouldShouldCircuit = true;

        return this;
    }
    hasShortCircuited() {
        return this._shouldShouldCircuit === true;
    }

    if(filter = []) {
        if(this.hasShortCircuited()) {
            return this;
        }

        if(typeof filter === "function") {
            let result = filter(this.Message);

            if(result === true) {
                return this;
            }

            return this._forceShortCircuit();
        }

        if(filter.includes(this.Message.type)) {
            return this;
        }

        return this._forceShortCircuit();
    }

    or(...bools) {
        if(this.hasShortCircuited()) {
            return this;
        }

        let result = bools[ 0 ];
        for(let input of bools) {
            result = result || input;
        }

        if(result === true) {
            return this;
        }

        return this._forceShortCircuit();
    }
    and(...bools) {
        if(this.hasShortCircuited()) {
            return this;
        }

        let result = bools[ 0 ];
        for(let input of bools) {
            result = result && input;
        }

        if(result === true) {
            return this;
        }

        return this._forceShortCircuit();
    }

    run(fn, name = null) {
        if(this.hasShortCircuited()) {
            return this;
        }

        if(typeof fn === "function") {
            let result = fn(this.Message, {
                state: this.State,
                scope: this.Scope,
                parent: this.Parent
            });  // State allows for carrying result values from one function to another

            name = name ? name : Object.keys(this.State).length;
            this.State[ name ] = result;

            return this;
        }

        return this._forceShortCircuit();
    }

    prop(propsObj = {}) {
        if(this.hasShortCircuited()) {
            return this;
        }

        let node = this.Scope;
        if(node instanceof Node && typeof propsObj === "object" && Object.keys(propsObj).length) {
            Object.entries(propsObj).forEach(([ key, value]) => {
                node.state[ key ] = value;
            });

            return this;
        }

        return this._forceShortCircuit();
    }
    state(stateObj) {
        if(this.hasShortCircuited()) {
            return this;
        }

        let node = this.Scope;
        if(node instanceof Node && stateObj) {
            node.state = stateObj;

            return this;
        }

        return this._forceShortCircuit();
    }

    send(type, payload, elevate = null) {
        if(this.hasShortCircuited()) {
            return this;
        }

        if(this.Scope instanceof Node) {
            this.Scope.send(type, payload, { elevate });

            return this;
        } else if(this.Parent instanceof Main) {
            this.Parent.send(type, payload, { elevate });

            return this;
        }

        return this._forceShortCircuit();
    }
    message(msg, elevate = null) {
        if(this.hasShortCircuited()) {
            return this;
        }

        if(this.Scope instanceof Node) {
            this.Scope.message(msg, { elevate });

            return this;
        } else if(this.Parent instanceof Main) {
            this.Parent.message(msg, { elevate });

            return this;
        }

        return this._forceShortCircuit();
    }

    static Process(msg) {
        return new MessageReceptionSequencer(msg);
    }
}