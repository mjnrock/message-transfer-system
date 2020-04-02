export default class StateChangeSequencer {
    static FocusType = {
        CURRENT: 1,
        PREVIOUS: 2,
        KEY: 3,
    };
    static ScopeType = {
        OR: "or",
        AND: "and"
    };

    constructor(msg, type = StateChangeSequencer.ScopeType.AND) {
        this._message = msg;

        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;
        
        this._focus = StateChangeSequencer.FocusType.CURRENT;
    }

    _beginScope(type = StateChangeSequencer.ScopeType.AND) {
        let scope = {
            type: type,
            parent: this._scope,
            children: []
        };

        this._currentScope.children.push(scope);
        this._currentScope = scope;
    }
    _endScope() {
        if(this._currentScope.parent) {
            this._currentScope = this._currentScope.parent;
        }
    }

    current() {
        this._focus = StateChangeSequencer.FocusType.CURRENT;

        return this;
    }
    previous() {
        this._focus = StateChangeSequencer.FocusType.PREVIOUS;

        return this;
    }
    key() {
        this._focus = StateChangeSequencer.FocusType.KEY;

        return this;
    }

    begin(type = StateChangeSequencer.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        this._endScope();

        return this;
    }
    
    _getFocus() {
        if(this._focus === StateChangeSequencer.FocusType.CURRENT) {
            return this._message.current;
        } else if(this._focus === StateChangeSequencer.FocusType.PREVIOUS) {
            return this._message.previous;
        } else if(this._focus === StateChangeSequencer.FocusType.KEY) {
            return this._message.key;
        }
    }

    or() {
        return this.begin(StateChangeSequencer.ScopeType.OR);
    }
    and() {
        return this.begin(StateChangeSequencer.ScopeType.AND);
    }


    //* COMPARATORS
    equals(input) {
        this._currentScope.children.push(this._getFocus() === input);

        return this;
    }
    gt(input) {
        this._currentScope.children.push(this._getFocus() > input);

        return this;
    }
    gte(input) {
        this._currentScope.children.push(this._getFocus() >= input);

        return this;
    }
    lt(input) {
        this._currentScope.children.push(this._getFocus() < input);

        return this;
    }
    lte(input) {
        this._currentScope.children.push(this._getFocus() <= input);

        return this;
    }
    in(...input) {
        this._currentScope.children.push(input.includes(this._getFocus()));

        return this;
    }
    between(a, b) {
        let focus = this._getFocus();
        this._currentScope.children.push((focus >= a) && (focus <= b));

        return this;
    }
    regex(pattern) {
        this._currentScope.children.push(pattern instanceof RegExp ? pattern.test(this._getFocus()) : false);

        return this;
    }
    
    //* NEGATED COMPARATORS
    notEquals(input) {
        this._currentScope.children.push(this._getFocus() !== input);

        return this;
    }
    notIn(...input) {
        this._currentScope.children.push(!(input.includes(this._getFocus())));

        return this;
    }
    notBetween(a, b) {
        let focus = this._getFocus();
        this._currentScope.children.push(!((focus >= a) && (focus <= b)));

        return this;
    }


    booleanize(scope) {
        let result = null;

        for(let child of scope.children) {
            if(typeof child === "object") {
                let childResult = this.booleanize(child);

                if(result === null || result === void 0) {
                    result = childResult;
                }

                if(child.type === StateChangeSequencer.ScopeType.AND) {
                    result = result && childResult;
                } else if(child.type === StateChangeSequencer.ScopeType.OR) {
                    result = result || childResult;
                }
            } else {
                if(result === null || result === void 0) {
                    result = child;
                }

                if(scope.type === StateChangeSequencer.ScopeType.AND) {
                    result = result && child;
                } else if(scope.type === StateChangeSequencer.ScopeType.OR) {
                    result = result || child;
                }
            }
        }

        return result;
    }



    //* TERMINAL FUNCTIONS
    /**
     * A default terminator function
     */
    done() {
        return this.getResult();
    }
    getResult() {
        let result = this.booleanize(this._scope);

        return result;
    }
    getMessage() {
        return this._message;
    }
    getScope() {
        return this._scope;
    }



    //* DEBUGGING FUNCTIONS
    _getDefaultArgs() {
        return [
            this._scopes
        ];
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