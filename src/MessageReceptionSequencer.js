import Message from "./Message";
import Node from "./Node";
import Main from "./Main";

export default class MessageReceptionSequencer {
    static Parent = null;   // Statically exposed, as only one of these should exist per runtime | Allows for a <Node> to be universally set as the scope

    constructor(msg, { scope = null } = {}) {
        this.Message = msg;

        this.Scope = scope || MessageReceptionSequencer.Parent;     // A <Node> to use for state/prop modifications if `this.state(...)` or `this.prop(...)` is called
        
        this.State = {};    // The state used as a fallback when `this.Scope` is not a <Node>
        this.Results = {};  // The holder of all `this.run(...)` results

        if(Message.conforms(msg)) {
            this._shouldShouldCircuit = false;
        } else {
            this._shouldShouldCircuit = true;
        }
    }

    /**
     * An internal function to force a short-circuit, thus preventing further modification to the MSR instance
     */
    _forceShortCircuit() {
        this._shouldShouldCircuit = true;

        return this;
    }

    /**
     * To be used within a conditional function, or post-hoc
     */
    check() {
        return this._shouldShouldCircuit === true;
    }

    /**
     * A manual override to "repair" a short circuit, if needed for w/e reason
     * @param {fn} condition If included, the internal short-circuit variable is set to the return value of this function
     */
    repair(condition) {
        if(typeof condition === "function") {
            this._shouldShouldCircuit = !!condition();
        } else {
            this._shouldShouldCircuit = false;
        }

        return this;
    }

    /**
     * This can be an array of SignalTypes or a function that returns a true or false result
     * @param {SignalTypes[]|fn<bool>} filters 
     */
    if(...filters) {
        if(this.check()) {
            return this;
        }

        if(typeof filters[ 0 ] === "function") {
            let result = filters[ 0 ](this.Message);

            if(result === true) {
                return this;
            }

            return this._forceShortCircuit();
        }

        if(filters.includes(this.Message.type)) {
            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * Can be direct booleans or functions that return booleans
     */
    or(...bools) {
        if(this.check()) {
            return this;
        }

        let result = bools[ 0 ];
        for(let input of bools) {
            if(typeof input === "function") {
                result = result || input(this.Message, {
                    state: this.State,
                    scope: this.Scope,
                    parent: MessageReceptionSequencer.Parent
                });
            } else {
                result = result || input;
            }
        }

        if(result === true) {
            return this;
        }

        return this._forceShortCircuit();
    }
    /**
     * Can be direct booleans or functions that return booleans
     */
    and(...bools) {
        if(this.check()) {
            return this;
        }

        let result = bools[ 0 ];
        for(let input of bools) {
            if(typeof input === "function") {
                result = result && input(this.Message, {
                    state: this.State,
                    scope: this.Scope,
                    parent: MessageReceptionSequencer.Parent
                });
            } else {
                result = result && input;
            }
        }

        if(result === true) {
            return this;
        }

        return this._forceShortCircuit();
    }

    
    /**
     * A function to execute and an optional name to call the result.  The result (even if void) is stored in `this.Results`
     * @param {fn} fn 
     * @param {string|number} name DEFAULT: null | 
     */
    run(fn, name = null) {
        if(this.check()) {
            return this;
        }

        if(typeof fn === "function") {
            let result = fn(this.Message, {
                state: this.State,
                scope: this.Scope,
                parent: MessageReceptionSequencer.Parent
            });  // State allows for carrying result values from one function to another

            name = name ? name : Object.keys(this.Results).length;
            this.Results[ name ] = result;

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * An object whose key:value pairs will be stored in `this.Scope.state` if activated, or in `this.State` as a fallback
     * @param {obj} propsObj 
     * @param {bool} useScope DEFAULT: false | If false, will update `this.State` instead of `this.Scope.state`
     */
    prop(propsObj = {}, useScope = false) {
        if(this.check()) {
            return this;
        }

        let node = this.Scope;
        if(typeof propsObj === "object" && Object.keys(propsObj).length) {
            if(node instanceof Node && useScope) {
                Object.entries(propsObj).forEach(([ key, value]) => {
                    node.state[ key ] = value;
                });
            } else {
                Object.entries(propsObj).forEach(([ key, value]) => {
                    this.State[ key ] = value;
                });
            }

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * An object that will overwrite `this.Scope.state` if activated, or `this.State` as a fallback
     * @param {obj} stateObj 
     * @param {bool} useScope DEFAULT: false | If false, will update `this.State` instead of `this.Scope.state`
     */
    state(stateObj, useScope = false) {
        if(this.check()) {
            return this;
        }

        let node = this.Scope;

        if(stateObj) {
            if(node instanceof Node && useScope) {
                node.state = stateObj;

                return this;
            }

            this.State = stateObj;

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * A `Node.send` elevation for `this.Scope` first, or `MessageReceptionSequencer.Parent` as a fallback.  Both absent will short-circuit the MSR.
     * @param {string|number} type 
     * @param {any} payload 
     * @param {true|string} elevate DEFAULT: null | 
     */
    send(type, payload, elevate = null) {
        if(this.check()) {
            return this;
        }

        if(this.Scope instanceof Node) {
            this.Scope.send(type, payload, { elevate });

            return this;
        } else if(MessageReceptionSequencer.Parent instanceof Main) {
            MessageReceptionSequencer.Parent.send(type, payload, { elevate });

            return this;
        }

        return this._forceShortCircuit();
    }
    /**
     * A `Node.message` elevation for `this.Scope` first, or `MessageReceptionSequencer.Parent` as a fallback.  Both absent will short-circuit the MSR.
     * @param {Message} msg
     * @param {true|string} elevate DEFAULT: null | 
     */
    message(msg, elevate = null) {
        if(this.check()) {
            return this;
        }

        if(this.Scope instanceof Node) {
            this.Scope.message(msg, { elevate });

            return this;
        } else if(MessageReceptionSequencer.Parent instanceof Main) {
            MessageReceptionSequencer.Parent.message(msg, { elevate });

            return this;
        }

        return this._forceShortCircuit();
    }


    //* TERMINAL FUNCTIONS: By their return types, these will prevent further chaining.
    getState() {
        return this.State;
    }
    /**
     * Return either `this.Results` or a name-filtered version of `this.Results`
     * @param  {...string} names 
     */
    getResults(...names) {
        if(names.length) {
            let results = {};

            for(let name of names) {
                results[ name ] = this.Results[ name ];
            }

            return results;
        }

        return this.Results;
    }
    getMessage() {
        return this.Message;
    }
    getScope() {
        return this.Scope;
    }
    getParent() {
        return MessageReceptionSequencer.Parent;
    }

    static Process(msg, opts) {
        return new MessageReceptionSequencer(msg, opts);
    }
}