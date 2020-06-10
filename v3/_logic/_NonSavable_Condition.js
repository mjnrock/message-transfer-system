import Signal from "../Signal";

export default class Condition {
    static FocusType = {
        TYPE: 1,    //  Signal property
        PAYLOAD: 2, //  Signal property
        SHAPE: 3,   //  Signal property
        TIMESTAMP: 4,   //  Signal property

        VALUE: 5,   //  A generic custom value for ad hoc purposes
    };
    static ScopeType = {
        OR: "or",
        AND: "and",

        NAND: "nor",
        NOR: "nand",
    };

    constructor(signalOrValue, type = Condition.ScopeType.AND) {
        if(Signal.Conforms(signalOrValue)) {
            this._signal = signalOrValue;
            this._value = null;
        } else {
            this._signal = null;
            this._value = signalOrValue;
        }

        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;
        
        this._focus = Condition.FocusType.CURRENT;
    }

    _beginScope(type = Condition.ScopeType.AND) {
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
        this._focus = Condition.FocusType.TYPE;

        if(types.length) {
            this.in(...types);
        }

        return this;
    }
    payload(prop) {
        this._focus = Condition.FocusType.PAYLOAD;

        if(prop) {
            let props = prop.split("."),
                res = this._signal.payload;

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
        this._focus = Condition.FocusType.SHAPE;
        
        if(shapes.length) {
            this.in(...shapes);
        }

        return this;
    }
    timestamp() {
        this._focus = Condition.FocusType.TIMESTAMP;

        return this;
    }

    value(value) {
        if(typeof value === "function") {
            this._value = value({ s: this._signal, p: this._signal.payload, t: this._signal.type, sh: this._signal.shape });
        } else {
            this._value = value;
        }
        this._focus = Condition.FocusType.VALUE;

        return this;
    }

    begin(type = Condition.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        this._endScope();

        return this;
    }
    
    _getFocus() {
        if(this._focus === Condition.FocusType.TYPE) {
            return this._signal.type;
        } else if(this._focus === Condition.FocusType.PAYLOAD) {
            return this._signal.payload;
        } else if(this._focus === Condition.FocusType.SHAPE) {
            return this._signal.shape;
        } else if(this._focus === Condition.FocusType.TIMESTAMP) {
            return this._signal.timestamp;
        } else if(this._focus === Condition.FocusType.VALUE) {
            return this._value;
        }

        return false;
    }

    or() {
        return this.begin(Condition.ScopeType.OR);
    }
    and() {
        return this.begin(Condition.ScopeType.AND);
    }
    nor() {
        return this.begin(Condition.ScopeType.NOR);
    }
    nand() {
        return this.begin(Condition.ScopeType.NAND);
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

    isA(type) {
        this._currentScope.children.push(typeof this._getFocus() === type);

        return this;
    }
    instanceOf(clazz) {
        this._currentScope.children.push(this._getFocus() instanceof clazz);

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

                if(child.type === Condition.ScopeType.AND || child.type === Condition.ScopeType.NAND) {
                    result = result && childResult;
                } else if(child.type === Condition.ScopeType.OR || child.type === Condition.ScopeType.NOR) {
                    result = result || childResult;
                }
            } else {
                if(result === null || result === void 0) {
                    result = child;
                }

                if(scope.type === Condition.ScopeType.AND || scope.type === Condition.ScopeType.NAND) {
                    result = result && child;
                } else if(scope.type === Condition.ScopeType.OR || scope.type === Condition.ScopeType.NOR) {
                    result = result || child;
                }
            }
        }

        if(scope.type === Condition.ScopeType.NOR || scope.type === Condition.ScopeType.NAND) {
            result = !result;
        }

        return result;
    }



    //* TERMINAL METHODS
    /**
     * A default terminator function
     */
    get done() {
        return this.getResult;
    }
    get getResult() {
        let result = this.evaluate(this._scope);

        return result;
    }
    get getSignal() {
        return this._signal;
    }
    get getScope() {
        return this._scope;
    }


    debug(fn = console.log) {
        if(typeof fn === "function") {
            fn.call(this, this._signal);
        }
    }

    static Process(signalOrValue, type = Condition.ScopeType.AND) {
        return new Condition(signalOrValue, type);
    }
};