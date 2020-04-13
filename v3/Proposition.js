import Message from "./Message";

export default class Proposition {
    static FocusType = {
        TYPE: 1,    //  Message property
        PAYLOAD: 2, //  Message property
        SHAPE: 3,   //  Message property
        TIMESTAMP: 4,   //  Message property

        VALUE: 5,   //  A generic custom value
    };
    static ScopeType = {
        OR: "or",
        AND: "and",

        NAND: "nor",
        NOR: "nand",
    };

    constructor(msgOrValue, type = Proposition.ScopeType.AND) {
        if(Message.conforms(msgOrValue)) {
            this._message = messageOrValue;
            this._value = null;
        } else {
            this._message = null;
            this._value = messageOrValue;
        }

        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;
        
        this._focus = Proposition.FocusType.CURRENT;
    }

    _beginScope(type = Proposition.ScopeType.AND) {
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

    type(...types) {
        this._focus = Proposition.FocusType.TYPE;

        if(types.length) {
            this.in(...types);
        }

        return this;
    }
    payload(prop) {
        this._focus = Proposition.FocusType.PAYLOAD;

        if(prop) {
            let props = prop.split("."),
                res = this._message.payload;

            for(let p of props) {
                if(res[ p ] !== void 0) {
                    res = res[ p ];
                }
            }

            this.value(res);
        }

        return this;
    }
    shape(...shapes) {
        this._focus = Proposition.FocusType.SHAPE;
        
        if(shapes.length) {
            this.in(...shapes);
        }

        return this;
    }
    timestamp() {
        this._focus = Proposition.FocusType.TIMESTAMP;

        return this;
    }

    value(value) {
        if(typeof value === "function") {
            this._value = value({ s: this._message, p: this._message.payload, t: this._message.type, sh: this._message.shape });
        } else {
            this._value = value;
        }
        this._focus = Proposition.FocusType.VALUE;

        return this;
    }

    begin(type = Proposition.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        this._endScope();

        return this;
    }
    
    _getFocus() {
        if(this._focus === Proposition.FocusType.TYPE) {
            return this._message.type;
        } else if(this._focus === Proposition.FocusType.PAYLOAD) {
            return this._message.payload;
        } else if(this._focus === Proposition.FocusType.SHAPE) {
            return this._message.shape;
        } else if(this._focus === Proposition.FocusType.TIMESTAMP) {
            return this._message.timestamp;
        } else if(this._focus === Proposition.FocusType.VALUE) {
            return this._value;
        }

        return false;
    }

    or() {
        return this.begin(Proposition.ScopeType.OR);
    }
    and() {
        return this.begin(Proposition.ScopeType.AND);
    }
    nor() {
        return this.begin(Proposition.ScopeType.NOR);
    }
    nand() {
        return this.begin(Proposition.ScopeType.NAND);
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


    evaluate(scope) {
        let result = null;

        for(let child of scope.children) {
            if(typeof child === "object") {
                let childResult = this.evaluate(child);

                if(result === null || result === void 0) {
                    result = childResult;
                }

                if(child.type === Proposition.ScopeType.AND || scope.type === Proposition.ScopeType.NAND) {
                    result = result && childResult;
                } else if(child.type === Proposition.ScopeType.OR || scope.type === Proposition.ScopeType.NOR) {
                    result = result || childResult;
                }
            } else {
                if(result === null || result === void 0) {
                    result = child;
                }

                if(scope.type === Proposition.ScopeType.AND || scope.type === Proposition.ScopeType.NAND) {
                    result = result && child;
                } else if(scope.type === Proposition.ScopeType.OR || scope.type === Proposition.ScopeType.NOR) {
                    result = result || child;
                }
            }
        }

        if(scope.type === Proposition.ScopeType.NOR || scope.type === Proposition.ScopeType.NAND) {
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
        let result = this.evaluate(this._scope);

        return result;
    }
    getMessage() {
        return this._message;
    }
    getScope() {
        return this._scope;
    }


    debug(fn = console.log) {
        if(typeof fn === "function") {
            fn.call(this, this._message);
        }
    }

    static Process(msgOrValue, type = Proposition.ScopeType.AND) {
        return new Proposition(msgOrValue, type);
    }
};