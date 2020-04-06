import { GenerateUUID } from "./helper";
import Node from "./Node";

export default class StateNode extends Node {
    static SignalType = {
        STATE_CHANGE: "StateNode.StateChange",
        PROP_CHANGE: "StateNode.PropChange",
        PROP_ARRAY_CHANGE: "StateNode.ArrayPropChange",
        PROP_OBJECT_CHANGE: "StateNode.ObjectPropChange",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(StateNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, mnode = null, packager = null } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            mnode: mnode,
            packager: packager
        });
    }

    setState(state = {}) {
        let oldValue = this._state;
        this._state = state;

        this.send(
            StateNode.SignalType.STATE_CHANGE,
            {
                previous: oldValue,
                current: state
            }
        );

        return this;
    }
    getState() {
        return this._state;
    }


    setProp(prop, value, typeKey = []) {
        let oldValue = this._state[ prop ];

        this._state[ prop ] = value;

        let payload = {
            key: prop,
            previous: oldValue,
            current: value
        };

        let [ type, key, oldValueSpecialCase, newValueSpecialCase ] = typeKey;

        this.send(
            StateNode.SignalType.PROP_CHANGE,
            payload
        );

        if(type === "a" || type === "A") {
            payload[ "key" ] = `${ prop }.${ key }`;
            payload[ "previous" ] = oldValueSpecialCase;
            payload[ "current" ] = newValueSpecialCase;

            this.send(
                StateNode.SignalType.PROP_ARRAY_CHANGE,
                payload
            );
        } else if(type === "o" || type === "O") {
            payload[ "key" ] = `${ prop }.${ key }`;
            payload[ "previous" ] = oldValueSpecialCase;
            payload[ "current" ] = newValueSpecialCase;

            this.send(
                StateNode.SignalType.PROP_OBJECT_CHANGE,
                payload
            );
        }

        return this;
    }
    getProp(prop) {
        return this._state[ prop ];
    }
    hasProp(prop) {
        return this._state[ prop ] !== void 0;
    }

    propIsEmpty(prop) {
        return this._state[ prop ] === null || this._state[ prop ] === void 0;
    }
    propIsType(prop, type) {
        return typeof this._state[ prop ] === type;
    }

    prop(prop, value) {
        if(value !== void 0) {
            return this.setProp(prop, value);
        }
        
        return this.getProp(prop);
    }
    aprop(prop, index, value) {
        if(index !== void 0) {
            if(value !== void 0) {
                let arr = this.getProp(prop),
                    oldValue;

                if(index === -1) {
                    arr.push(value);
                } else {
                    oldValue = arr[ +index ] ;

                    arr[ +index ] = value;
                }

                return this.setProp(prop, arr, [ "a", index, oldValue, value ]);
            } else {
                return this.getProp(prop)[ +index ];
            }
        }
            
        return this.getProp(prop);
    }

    oprop(prop, key, value) {
        if(key !== void 0) {
            let obj = this.getProp(prop);  // a moving reference to internal objects within obj
            let schema = this.getProp(prop);  // a moving reference to internal objects within obj
            let pList = key.split(".");
            let len = pList.length;

            for(let i = 0; i < len - 1; i++) {
                let elem = pList[ i ];

                if(!schema[ elem ]) {
                    schema[ elem ] = {};
                }

                schema = schema[ elem ];
            }

            if(value !== void 0) {
                let oldValue = schema[ pList[ len - 1 ] ];
                schema[ pList[ len - 1 ] ] = value;

                return this.setProp(prop, obj, [ "o", key, oldValue, value ]);
            } else {
                return schema[ pList[ len - 1 ] ];
            }
        }
            
        return this.getProp(prop);
    }
};