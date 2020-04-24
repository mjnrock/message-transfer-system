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

    constructor(signalOrValue, { type = Condition.ScopeType.AND, scope } = {}) {
        if(Signal.Conforms(signalOrValue)) {
            this._signal = signalOrValue;
            this._value = null;
        } else {
            this._signal = null;
            this._value = signalOrValue;
        }

        this._scope = scope || {
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
        this._currentScope.children.push([ Condition.FocusType.TYPE, ...types ]);

        if(types.length) {
            this.in(...types);
        }

        return this;
    }
    payload(prop) {
        this._currentScope.children.push([ Condition.FocusType.PAYLOAD, prop ]);

        return this;
    }
    shape(...shapes) {
        this._currentScope.children.push([ Condition.FocusType.SHAPE, ...shapes ]);
        
        if(shapes.length) {
            this.in(...shapes);
        }

        return this;
    }
    timestamp() {
        this._currentScope.children.push([ Condition.FocusType.TIMESTAMP ]);

        return this;
    }

    value(value) {
        this._currentScope.children.push([ Condition.FocusType.TYPE, value ]);

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
        this._currentScope.children.push(val => val === input);

        return this;
    }
    gt(input) {
        this._currentScope.children.push(val => val > input);

        return this;
    }
    gte(input) {
        this._currentScope.children.push(val => val >= input);

        return this;
    }
    lt(input) {
        this._currentScope.children.push(val => val < input);

        return this;
    }
    lte(input) {
        this._currentScope.children.push(val => val <= input);

        return this;
    }
    in(...input) {
        this._currentScope.children.push(val => input.includes(val));

        return this;
    }
    between(a, b) {
        this._currentScope.children.push(val => (val >= a) && (val <= b));

        return this;
    }
    regex(pattern) {
        this._currentScope.children.push(val => pattern instanceof RegExp ? pattern.test(val) : false);

        return this;
    }

    isA(type) {
        this._currentScope.children.push(val => typeof val === type);

        return this;
    }
    instanceOf(clazz) {
        this._currentScope.children.push(val => val instanceof clazz);

        return this;
    }
    
    //* NEGATED COMPARATORS
    notEquals(input) {
        this._currentScope.children.push(val => val !== input);

        return this;
    }
    notIn(...input) {
        this._currentScope.children.push(val => !(input.includes(val)));

        return this;
    }
    notBetween(a, b) {
        this._currentScope.children.push(val => !((val >= a) && (val <= b)));

        return this;
    }


    _evalResult(scope, result, input) {
        if(result === null || result === void 0) {
            result = input;
        }

        if(scope.type === Condition.ScopeType.AND || scope.type === Condition.ScopeType.NAND) {
            result = result && input;
        } else if(scope.type === Condition.ScopeType.OR || scope.type === Condition.ScopeType.NOR) {
            result = result || input;
        }

        return result;
    }
    _evalValue(value) {
        if(typeof value === "function") {
            this._value = value({ s: this._signal, p: this._signal.payload, t: this._signal.type, sh: this._signal.shape });
        } else {
            this._value = value;
        }
    }

    evaluate(scope) {
        let result = null;

        for(let child of scope.children) {
            if(typeof child === "function") {
                result = this._evalResult(scope, result, child(this._getFocus()));
            } else if(Array.isArray(child)) {
                this._focus = child[ 0 ];

                if(this._focus === Condition.FocusType.PAYLOAD) {
                    if(child[ 1 ]) {
                        let props = child[ 1 ].split("."),
                            res = this._signal.payload;

                        for(let p of props) {
                            if(res[ p ] !== void 0) {
                                res = res[ p ];
                            }
                        }

                        this._focus = res;
                    }
                }
                if(this._focus === Condition.FocusType.VALUE) {
                    this._evalValue(child[ 0 ])
                }
            } else if(typeof child === "object") {
                result = this._evalResult(scope, result, this.evaluate(child));
            } else {
                result = this._evalResult(scope, result, child);
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

    get package() {
        let scope = this.getScope;

        return signal => (new Condition(signal, { type: scope.type, scope })).done;
    }


    debug(fn = console.log) {
        if(typeof fn === "function") {
            fn.call(this, this._signal);
        }
    }

    static Process(signalOrValue, type = Condition.ScopeType.AND) {
        return new Condition(signalOrValue, { type });
    }
};