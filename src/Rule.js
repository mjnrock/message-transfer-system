import Message from "./Message";

export default class Rule {
    static FocusType = {
        // For Node.StateChange or Node.PropChange Messages
        CURRENT: 1,
        PREVIOUS: 2,
        KEY: 3,

        // For other Messages
        TYPE: 4,
        PAYLOAD: 5,
        SOURCE: 6,

        // For running a rule without using a Message
        VALUE: 7,
    };
    static ScopeType = {
        OR: "or",
        AND: "and",

        NAND: "nor",
        NOR: "nand",
    };

    constructor(msgOrValue, type = Rule.ScopeType.AND) {
        if(Message.conforms(msgOrValue)) {
            this._message = msgOrValue;
            this._value = null;
        } else {
            this._message = null;
            this._value = msgOrValue;
        }

        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;
        
        this._focus = Rule.FocusType.CURRENT;
    }

    _beginScope(type = Rule.ScopeType.AND) {
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
        this._focus = Rule.FocusType.CURRENT;

        return this;
    }
    previous() {
        this._focus = Rule.FocusType.PREVIOUS;

        return this;
    }
    key() {
        this._focus = Rule.FocusType.KEY;

        return this;
    }

    type() {
        this._focus = Rule.FocusType.TYPE;

        return this;
    }
    payload() {
        this._focus = Rule.FocusType.PAYLOAD;

        return this;
    }
    source() {
        this._focus = Rule.FocusType.SOURCE;

        return this;
    }

    value(value) {
        this._value = value;
        this._focus = Rule.FocusType.VALUE;

        return this;
    }

    begin(type = Rule.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        this._endScope();

        return this;
    }
    
    _getFocus() {
        if(this._focus === Rule.FocusType.CURRENT) {
            return this._message.payload.current;
        } else if(this._focus === Rule.FocusType.PREVIOUS) {
            return this._message.payload.previous;
        } else if(this._focus === Rule.FocusType.KEY) {
            return this._message.payload.key;
        } else if(this._focus === Rule.FocusType.TYPE) {
            return this._message.type;
        } else if(this._focus === Rule.FocusType.PAYLOAD) {
            return this._message.payload;
        } else if(this._focus === Rule.FocusType.SOURCE) {
            return this._message.source;
        } else if(this._focus === Rule.FocusType.VALUE) {
            return this._value;
        }

        return false;
    }

    or() {
        return this.begin(Rule.ScopeType.OR);
    }
    and() {
        return this.begin(Rule.ScopeType.AND);
    }
    nor() {
        return this.begin(Rule.ScopeType.NOR);
    }
    nand() {
        return this.begin(Rule.ScopeType.NAND);
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

                if(child.type === Rule.ScopeType.AND || scope.type === Rule.ScopeType.NAND) {
                    result = result && childResult;
                } else if(child.type === Rule.ScopeType.OR || scope.type === Rule.ScopeType.NOR) {
                    result = result || childResult;
                }
            } else {
                if(result === null || result === void 0) {
                    result = child;
                }

                if(scope.type === Rule.ScopeType.AND || scope.type === Rule.ScopeType.NAND) {
                    result = result && child;
                } else if(scope.type === Rule.ScopeType.OR || scope.type === Rule.ScopeType.NOR) {
                    result = result || child;
                }
            }
        }

        if(scope.type === Rule.ScopeType.NOR || scope.type === Rule.ScopeType.NAND) {
            result = !result;
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

    static Process(msg, type = Rule.ScopeType.AND) {
        return new Rule(msg, type);
    }
};