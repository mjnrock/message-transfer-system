import { GenerateUUID } from "./helper";
import Node from "./Node";

export default class ActionNode extends Node {
    static SignalType = {
        "ADD_ACTION": "ActionNode.AddAction",
        "REMOVE_ACTION": "ActionNode.RemoveAction",
        "RUN_ACTION": "ActionNode.RunAction",
        "CALL_ACTION": "ActionNode.CallAction",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(ActionNode.SignalTypes).filter(st => {
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

    addAction(name, fn) {
        if(typeof fn === "function") {
            this.internal[ name ] = fn;

            this.emit(
                ActionNode.SignalType.ADD_ACTION,
                name
            );
        }

        return this;
    }
    removeAction(name) {
        delete this.internal[ name ];

        this.emit(
            ActionNode.SignalType.REMOVE_ACTION,
            name
        );

        return this;
    }

    run(name) {
        let fn = this.internal[ name ];
        if(typeof fn === "function") {
            let result = fn(...this._getDefaultArgs());

            this.emit(
                ActionNode.SignalType.RUN_ACTION,
                {
                    name: name,
                    result: result
                }
            );

            return result;
        }

        return;
    }
    call(name, ...args) {
        let fn = this.internal[ name ];
        if(typeof fn === "function") {
            let result = fn(...args);

            this.emit(
                ActionNode.SignalType.CALL_ACTION,
                {
                    name: name,
                    result: result
                }
            );

            return result;
        }

        return;
    }

    
    _getDefaultArgs() {
        return [
            this._state,
            {
                node: this._state,
                mnode: MessageReceptionSequencer.MasterNode,
            }
        ];
    }
};