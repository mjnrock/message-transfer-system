import { GenerateUUID } from "./helper";

export default class StateChangeSequencerFactory {
    static FocusType = {
        CURRENT: 1,
        PREVIOUS: 2,
        KEY: 3,
    };
    static ScopeType = {
        OR: "or",
        AND: "and"
    };

    constructor(msg, type = StateChangeSequencerFactory.ScopeType.AND) {
        this._message = msg;

        this._state = null;
        // this._scopes = [
        //     type,
        //     []
        // ];
        // this._depth = 0;
        // this._currentScope = this._scopes[ 1 ];
        
        this._scope = {
            type: type,
            parent: null,
            children: []
        };
        this._currentScope = this._scope;


        this._lastStatusResult = null;
        
        this._focus = StateChangeSequencerFactory.FocusType.CURRENT;
    }

    getFocusParameter() {
        if(this._focus === StateChangeSequencerFactory.FocusType.CURRENT) {
            return "msg.current";
        } else if(this._focus === StateChangeSequencerFactory.FocusType.PREVIOUS) {
            return "msg.previous";
        } else if(this._focus === StateChangeSequencerFactory.FocusType.KEY) {
            return "msg.key";
        }
    }

    _beginScope(type = StateChangeSequencerFactory.ScopeType.AND) {
        // this._currentScope.push([
        //     type,
        //     []
        // ]);
        // this._depth += 1;
        // this._currentScope = this._currentScope[ this._currentScope.length - 1][ 1 ];

        let scope = {
            type: type,
            parent: this._scope,
            children: []
        };

        this._currentScope.children.push(scope);
        this._currentScope = scope;
    }
    _endScope() {
        // this._depth -= 1;
        // let scope = this._scopes[ 1 ];
        // for(let i = 1; i < this._depth; i++) {
        //     scope = scope[ i ][ 1 ];
        // }

        // this._currentScope = scope;

        if(this._currentScope.parent) {
            this._currentScope = this._currentScope.parent;
        }
    }

    current() {
        this._focus = StateChangeSequencerFactory.FocusType.CURRENT;

        return this;
    }
    previous() {
        this._focus = StateChangeSequencerFactory.FocusType.PREVIOUS;

        return this;
    }
    key() {
        this._focus = StateChangeSequencerFactory.FocusType.KEY;

        return this;
    }

    begin(type = StateChangeSequencerFactory.ScopeType.AND) {
        this._beginScope(type);

        return this;
    }
    end() {
        // this._endScope(this._currentScope.id);
        this._endScope();

        return this;
    }

    or() {
        return this.begin(StateChangeSequencerFactory.ScopeType.OR);
    }
    and() {
        return this.begin(StateChangeSequencerFactory.ScopeType.AND);
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

        if(scope.type === StateChangeSequencerFactory.ScopeType.AND) {
            joiner = " && ";
        } else if(scope.type === StateChangeSequencerFactory.ScopeType.OR) {
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

    static Process(msg, type = StateChangeSequencerFactory.ScopeType.AND) {
        return new StateChangeSequencerFactory(msg, type);
    }
};