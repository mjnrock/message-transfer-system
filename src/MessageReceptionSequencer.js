import Message from "./Message";
import Node from "./Node";

export default class MessageReceptionSequencer {
    static Parent = null;   // Statically exposed, as only one of these should exist per runtime | Allows for a <Node> to be universally set as the scope

    constructor(msg, { scope = null, useParent = false } = {}) {
        this._message = msg;

        if(useParent) {
            this._scope = MessageReceptionSequencer.Parent;
        } else {
            this._scope = scope;    // A <Node> to use for state/prop modifications if `this.state(...)` or `this.prop(...)` is called
        }
        
        this._state = {};    // The state used as a fallback when `this.Scope` is not a <Node>
        this._results = {};  // The holder of all `this.run(...)` results

        if(Message.conforms(msg)) {
            this._shouldShouldCircuit = false;
        } else {
            this._shouldShouldCircuit = true;
        }
    }

    /**
     * A default argument helper function for any function invocation in a method
     */
    _getDefaultArgs() {
        return [
            this._message,
            {
                state: this._state,
                results: this._results,
                scope: this._scope,
                parent: MessageReceptionSequencer.Parent,
                isActive: !this.check()
            }
        ];
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
     * A manual override to "repair" a short circuit, if needed for w/e reason.  A function<bool> can be passed, to conditionally repair.
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
        this.repair();  // Conditionals self-repair to allow for scoping

        if(typeof filters[ 0 ] === "function") {
            let result = filters[ 0 ](this._message);

            if(result === true) {
                return this;
            }

            return this._forceShortCircuit();
        }

        if(filters.includes(this._message.type)) {
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
                result = result || input(...this._getDefaultArgs());
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
                result = result && input(...this._getDefaultArgs());
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
            let result = fn(...this._getDefaultArgs());  // State allows for carrying result values from one function to another

            name = name ? name : Object.keys(this._results).length;
            this._results[ name ] = result;

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * A variant of `this.run(...)` that does not presume parameters are relevant, but can be optionally passed
     * @param {fn} fn 
     * @param  {...any} args 
     */
    call(fn, ...args) {
        if(this.check()) {
            return this;
        }

        if(typeof fn === "function") {
            fn(...args);

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * An object whose key:value pairs will be stored in `this.Scope.state` if activated, or in `this.State` as a fallback
     * @param {obj} propsObj 
     * @param {bool} useScope DEFAULT: true | If false, will update `this.State` instead of `this.Scope.state`
     */
    prop(propsObj = {}, useScope = true) {
        if(this.check()) {
            return this;
        }

        let node = this._scope;
        if(typeof propsObj === "object" && Object.keys(propsObj).length) {
            if(node instanceof Node && useScope) {
                Object.entries(propsObj).forEach(([ key, value]) => {
                    node.state[ key ] = value;
                });
            } else {
                Object.entries(propsObj).forEach(([ key, value]) => {
                    this._state[ key ] = value;
                });
            }

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * An object that will overwrite `this.Scope.state` if activated, or `this.State` as a fallback
     * @param {obj} stateObj 
     * @param {bool} useScope DEFAULT: true | If false, will update `this.State` instead of `this.Scope.state`
     */
    state(stateObj, useScope = true) {
        if(this.check()) {
            return this;
        }

        let node = this._scope;

        if(stateObj) {
            if(node instanceof Node && useScope) {
                node.state = stateObj;

                return this;
            }

            this._state = stateObj;

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

        if(this._scope instanceof Node) {
            this._scope.send(type, payload, { elevate });

            return this;
        } else if(MessageReceptionSequencer.Parent instanceof Node) {
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

        if(this._scope instanceof Node) {
            this._scope.message(msg, { elevate });

            return this;
        } else if(MessageReceptionSequencer.Parent instanceof Node) {
            MessageReceptionSequencer.Parent.message(msg, { elevate });

            return this;
        }

        return this._forceShortCircuit();
    }

    /**
     * A debugging function that uses `console.log` as its default function.
     * It will provide `this`, but with relevant pieces also broken out already, for convenience.
     * ! It does not adhere to `this.check()`
     * @param {fn} fn DEFAULT: console.log | a function to pass debugging information to
     */
    debug(fn = console.log) {
        if(typeof fn === "function") {
            fn(...this._getDefaultArgs());

            return this;
        }

        return this;
    }


    //* TERMINAL FUNCTIONS: By their return types, these will prevent further chaining.
    getState() {
        return this._state;
    }
    /**
     * Return either `this.Results` or a name-filtered version of `this.Results`
     * @param  {...string} names 
     */
    getResults(...names) {
        if(names.length) {
            let results = {};

            for(let name of names) {
                results[ name ] = this._results[ name ];
            }

            return results;
        }

        return this._results;
    }
    getMessage() {
        return this._message;
    }
    getScope() {
        return this._scope;
    }
    getParent() {
        return MessageReceptionSequencer.Parent;
    }

    static Process(msg, opts) {
        return new MessageReceptionSequencer(msg, opts);
    }
}