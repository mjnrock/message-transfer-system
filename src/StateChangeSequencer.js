import { GenerateUUID } from "./helper";

export default class StateChangeSequencer {
    static FocusType = {
        CURRENT: 1,
        PREVIOUS: 2,
        KEY: 3,
    };
    static ScopeType = {
        OR: "or",
        AND: "and",
        // NOT: "not",
        // NOR: "nor"
    };

    constructor(msg, type = StateChangeSequencer.ScopeType.AND) {
        this._message = msg;

        this._state = null;
        this._scopes = {};
        this._currentScope = null;
        this._lastStatusResult = null;
        
        this._focus = StateChangeSequencer.FocusType.CURRENT;
        
        this._beginScope(null, type);
    }

    /**
     * Create a new scope
     */
    _beginScope(parent = null, scopeType = StateChangeSequencer.ScopeType.AND) {
        let scope = {
            id: GenerateUUID(),
            parent: parent,
            status: null,
            type: scopeType
        };

        this._scopes[ scope.id ] = scope;
        this._currentScope = scope;

        return scope;
    }
    /**
     * End a scope
     */
    _endScope(id) {
        let status = this._scopes[ id ].status;

        this._currentScope = this._scopes[ id ].parent;
        delete this._scopes[ id ];

        return status;
    }

    /**
     * An alias to the current scope's status
     */
    get status() {        
        return this._currentScope.status;
    }
    /**
     * An alias to the current scope's status
     */
    set status(value) {
        this._currentScope.status = value;

        if(this._currentScope.parent === null) {
            if(this._state === null) {
                this._state = value;
            }

            let type = this._currentScope.type;
            if(type === StateChangeSequencer.ScopeType.OR) {
                this._state = this._state || value;
            } else if(type === StateChangeSequencer.ScopeType.AND) {
                this._state = this._state && value;
            }
        }
    }
    /**
     * Returns whether or not the status has become false.
     * As such, this is a negated function.
     */
    check() {
        if(this._currentScope.status === null || this._currentScope.status === void 0) {
            return false;
        }

        return !this._currentScope.status;
    }

    /**
     * Sets the focus on the `Message.current`
     */
    current() {
        this._focus = StateChangeSequencer.FocusType.CURRENT;

        return this;
    }
    /**
     * Sets the focus on the `Message.previous`
     */
    previous() {
        this._focus = StateChangeSequencer.FocusType.PREVIOUS;

        return this;
    }
    /**
     * Sets the focus on the `Message.key`
     */
    key() {
        this._focus = StateChangeSequencer.FocusType.KEY;

        return this;
    }

    /**
     * Opens a sub-scope block
     * @param {ScopeType|string} scopeType 
     */
    begin(scopeType = StateChangeSequencer.ScopeType.AND) {
        this._beginScope(this._currentScope, scopeType);

        return this;
    }
    /**
     * For any method called in the list below, `.end()` will close the current sub-scope.
     * As the parent is undefined for the root, calling `.end()` on the root scope will cause an error, intentionally, as that is a noop.
     * Affects:
     *      `.begin(...)`
     *      `.or()`
     *      `.and()`
     */
    end() {
        let scope = this._currentScope,
            parent = this._currentScope.parent,
            status = this._endScope(scope.id);

        // if(scope.type === StateChangeSequencer.ScopeType.NOT || scope.type === StateChangeSequencer.ScopeType.NOR) {
        //     status = !status;
        // }

        if(this._state === null || this._state === void 0) {
            this._state = status;
        }

        if(parent.type === StateChangeSequencer.ScopeType.OR) {
            this._state = this._state || status;
        } else if(parent.type === StateChangeSequencer.ScopeType.AND) {
            this._state = this._state && status;
        }
        // else if(parent.type === StateChangeSequencer.ScopeType.NOT) {
        //     this._state = this._state && status;
        // } else if(parent.type === StateChangeSequencer.ScopeType.NOR) {
        //     this._state = this._state || status;
        // }

        return this;
    }

    /**
     * And alias of `.begin(StateChangeSequencer.ScopeType.OR)`
     */
    or() {
        return this.begin(StateChangeSequencer.ScopeType.OR);
    }
    /**
     * And alias of `.begin(StateChangeSequencer.ScopeType.AND)`
     */
    and() {
        return this.begin(StateChangeSequencer.ScopeType.AND);
    }
    // not() {
    //     return this.begin(StateChangeSequencer.ScopeType.NOT);
    // }
    // nor() {
    //     return this.begin(StateChangeSequencer.ScopeType.NOR);
    // }

    /**
     * Return the appropriate Message property, based on `this._focus`
     */
    _getFocus() {
        if(this._focus === StateChangeSequencer.FocusType.CURRENT) {
            return this._message.current;
        } else if(this._focus === StateChangeSequencer.FocusType.PREVIOUS) {
            return this._message.previous;
        } else if(this._focus === StateChangeSequencer.FocusType.KEY) {
            return this._message.key;
        }
    }

    /**
     * Compare `this.status` to the input value, based on the current scope's type
     */
    _evaluateScopeType(value) {
        this._lastStatusResult = value;
        if(this.status === null || this.status === void 0) {
            this.status = value;
        }

        if(this._currentScope.type === StateChangeSequencer.ScopeType.AND) {
            return this.status && value;
        } else if(this._currentScope.type === StateChangeSequencer.ScopeType.OR) {
            return this.status || value;
        }
        
        //* These are identical to AND and OR *at this level*, as they will be reconciled on a .end() call
        // else if(this._currentScope.type === StateChangeSequencer.ScopeType.NOT) {
        //     return left && right;
        // } else if(this._currentScope.type === StateChangeSequencer.ScopeType.NOR) {
        //     return left || right;
        // }

        return false;
    }

    //* COMPARATORS
    equals(input) {        
        let focus = this._getFocus();
        let status = focus === input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    gt(input) {
        let focus = this._getFocus();
        let status = focus > input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    gte(input) {
        let focus = this._getFocus();
        let status = focus >= input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    lt(input) {
        let focus = this._getFocus();
        let status = focus < input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    lte(input) {
        let focus = this._getFocus();
        let status = focus <= input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    in(...input) {
        let focus = this._getFocus();
        let status = input.includes(focus);

        this.status = this._evaluateScopeType(status);

        return this;
    }
    between(a, b) {
        let focus = this._getFocus();
        let status = (focus >= a && focus <= b);

        this.status = this._evaluateScopeType(status);

        return this;
    }
    regex(pattern) {
        let focus = this._getFocus();
        let status = pattern instanceof RegExp ? pattern.test(focus) : false;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    
    //* NEGATED COMPARATORS
    notEquals(input) {        
        let focus = this._getFocus();
        let status = focus !== input;

        this.status = this._evaluateScopeType(status);

        return this;
    }
    notIn(...input) {
        let focus = this._getFocus();
        let status = !(input.includes(focus));

        this.status = this._evaluateScopeType(status);

        return this;
    }
    notBetween(a, b) {
        let focus = this._getFocus();
        let status = !(focus >= a && focus <= b);

        this.status = this._evaluateScopeType(status);

        return this;
    }



    //* TERMINAL FUNCTIONS
    /**
     * A default terminator function
     */
    done() {
        return this.getState();
    }
    getState() {
        return this._state;
    }
    getMessage() {
        return this._message;
    }



    //* DEBUGGING FUNCTIONS
    _getDefaultArgs() {
        return [
            this._scopes
        ];
    }
    peek() {
        console.log(`${ this._lastStatusResult }|${ this.status }|${ this._state }`);

        return this;
    }
    debug(fn = console.log) {
        if(typeof fn === "function") {
            fn(...this._getDefaultArgs());

            return this;
        }

        return this;
    }

    static Process(msg, type = StateChangeSequencer.ScopeType.AND) {
        return new StateChangeSequencer(msg, type);
    }
};