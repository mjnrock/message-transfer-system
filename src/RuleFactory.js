//! ---------------------------------------------------
//!     Presently Not in Sync with Rule.js
//!     Update to account for .value()
//! ---------------------------------------------------

export default class RuleFactory {
    static FocusType = {
        CURRENT: 1,
        PREVIOUS: 2,
        KEY: 3,

        TYPE: 4,
        PAYLOAD: 5,
        SOURCE: 6,
    };
    static ScopeType = {
        OR: "or",
        AND: "and",
        
        NAND: "nand",
        NOR: "nor",
    };

    constructor(msg, type = RuleFactory.ScopeType.AND) {
        this._message = msg;

        this._state = null;
        
        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;


        this._lastStatusResult = null;
        
        this._focus = RuleFactory.FocusType.CURRENT;
    }

    getFocusParameter() {
        if(this._focus === RuleFactory.FocusType.CURRENT) {
            return "msg.payload.current";
        } else if(this._focus === RuleFactory.FocusType.PREVIOUS) {
            return "msg.payload.previous";
        } else if(this._focus === RuleFactory.FocusType.KEY) {
            return "msg.payload.key";
        } else if(this._focus === RuleFactory.FocusType.TYPE) {
            return "msg.type";
        } else if(this._focus === RuleFactory.FocusType.PAYLOAD) {
            return "msg.payload";
        } else if(this._focus === RuleFactory.FocusType.SOURCE) {
            return "msg.source";
        }
    }

    _beginScope(type = RuleFactory.ScopeType.AND) {
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
        this._focus = RuleFactory.FocusType.CURRENT;

        return this;
    }
    previous() {
        this._focus = RuleFactory.FocusType.PREVIOUS;

        return this;
    }
    key() {
        this._focus = RuleFactory.FocusType.KEY;

        return this;
    }

    type() {
        this._focus = RuleFactory.FocusType.TYPE;

        return this;
    }
    payload() {
        this._focus = RuleFactory.FocusType.PAYLOAD;

        return this;
    }
    source() {
        this._focus = RuleFactory.FocusType.SOURCE;

        return this;
    }

    begin(type = RuleFactory.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        this._endScope();

        return this;
    }

    or() {
        return this.begin(RuleFactory.ScopeType.OR);
    }
    and() {
        return this.begin(RuleFactory.ScopeType.AND);
    }
    nor() {
        return this.begin(RuleFactory.ScopeType.NOR);
    }
    nand() {
        return this.begin(RuleFactory.ScopeType.NAND);
    }


    //* COMPARATORS
    equals(input) {        
        this._currentScope.children.push(`(${ this.getFocusParameter() } === ${ input })`);

        return this;
    }
    gt(input) {
        this._currentScope.children.push(`(${ this.getFocusParameter() } > ${ input })`);

        return this;
    }
    gte(input) {
        this._currentScope.children.push(`(${ this.getFocusParameter() } >= ${ input })`);

        return this;
    }
    lt(input) {
        this._currentScope.children.push(`(${ this.getFocusParameter() } < ${ input })`);

        return this;
    }
    lte(input) {        
        this._currentScope.children.push(`(${ this.getFocusParameter() } <= ${ input })`);

        return this;
    }
    in(...input) {
        this._currentScope.children.push(`(${ input }.includes(${ this.getFocusParameter() }))`);

        return this;
    }
    between(a, b) {
        this._currentScope.children.push(`(${ this.getFocusParameter() } >= ${ a } && ${ this.getFocusParameter() } <= ${ b })`);

        return this;
    }
    regex(pattern) {        
        this._currentScope.children.push(`(${ pattern instanceof RegExp ? `${ pattern }.test(${ this.getFocusParameter() })` : false })`);

        return this;
    }
    
    //* NEGATED COMPARATORS
    notEquals(input) {
        this._currentScope.children.push(`(${ this.getFocusParameter() } !== ${ input })`);

        return this;
    }
    notIn(...input) {
        this._currentScope.children.push(`(!(${ input }.includes(${ this.getFocusParameter() })))`);

        return this;
    }
    notBetween(a, b) {
        this._currentScope.children.push(`(!(${ this.getFocusParameter() } >= ${ a } && ${ this.getFocusParameter() } <= ${ b }))`);

        return this;
    }


    schematize(scope) {
        let schema = "(",
            joiner = "";

        if(scope.type === RuleFactory.ScopeType.AND || scope.type === RuleFactory.ScopeType.NAND) {
            joiner = " && ";
        } else if(scope.type === RuleFactory.ScopeType.OR || scope.type === RuleFactory.ScopeType.NOR) {
            joiner = " || ";
        }

        let children = [];
        for(let child of scope.children) {
            if(typeof child === "object") {
                children.push(this.schematize(child));
            } else if(typeof child === "string" || child instanceof String) {
                children.push(child);
            }
        }

        schema += children.join(joiner);

        if(scope.type === RuleFactory.ScopeType.NAND || scope.type === RuleFactory.ScopeType.NOR) {
            schema = `(!${ schema })`;
        }

        return `${ schema })`;
    }



    //* TERMINAL FUNCTIONS
    /**
     * A default terminator function
     */
    done() {
        return this.getSchema();
    }
    getSchema() {
        let schema = this.schematize(this._scope);

        return `msg => ${ schema }`;
    }
    getState() {
        return this._state;
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

    static Process(msg, type = RuleFactory.ScopeType.AND) {
        return new RuleFactory(msg, type);
    }
};