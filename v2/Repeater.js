import { Bitwise, GenerateUUID, Dice } from "./helper";
import Node from "./Node";
import Message from "./Message";

export default class Repeater extends Node {
    static SignalType = {
        INTERVAL_STATIC: "Repeater.IntervalStatic",
        INTERVAL_RANDOM: "Repeater.IntervalRandom",
        INTERVAL_FORMULAIC: "Repeater.IntervalFormulaic",

        TIMEOUT_STATIC: "Repeater.TimeoutStatic",
        TIMEOUT_RANDOM: "Repeater.TimeoutRandom",
        TIMEOUT_FORMULAIC: "Repeater.TimeoutFormulaic",
    };

    static TimeType = {
        STATIC: 1,
        RANDOM: 2,
        FORMULAIC: 3
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(Repeater.SignalTypes).filter(st => {
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

        this.internal = {
            Intervals: {},
            Timeouts: {}
        };
    }

    addTimeout(input, timeValue, { name = GenerateUUID() } = {}) {
        let type = Repeater.TimeType.STATIC,
            id = null;

        if(typeof timeValue === "number") {
            type = Repeater.TimeType.STATIC;

            if(typeof input === "function") {
                id = setTimeout(input, parseFloat(timeValue), ...this._getDefaultArgs());
            } else if(Array.isArray(input)) {
                id = setTimeout(() => this.send(...input), parseFloat(timeValue));
            } else if("type" in input && "payload" in input) {
                id = setTimeout(() => this.send(input.type, input.payload), parseFloat(timeValue));
            }

            if(id) {
                this.internal.Timeouts[ name ] = {
                    id,
                    type,
                    name
                };
    
                return name;
            }
        } else if(typeof timeValue === "function") {
            let timeout = timeValue(...this._getDefaultArgs());

            type = Repeater.TimeType.FORMULAIC;

            return this.addTimeout(input, timeout, { name });
        } else if(Array.isArray(timeValue)) {
            let [ min, max ] = timeValue;

            type = Repeater.TimeType.RANDOM;            

            return this.addTimeout(input, Dice.random(min, max), { name });
        }
        
        return false;
    }
    clearTimeout(name) {
        clearTimeout(this.internal.Timeouts[ name ].id);
        delete this.internal.Timeouts[ name ];

        return this;
    }

    addInterval(input, timeValue, { name = GenerateUUID() } = {}) {
        let type = Repeater.TimeType.STATIC,
            id = null;

        if(typeof timeValue === "number") {
            type = Repeater.TimeType.STATIC;

            if(typeof input === "function") {
                id = setInterval(input, parseFloat(timeValue), ...this._getDefaultArgs());
            } else if(Array.isArray(input)) {
                id = setInterval(() => this.send(...input), parseFloat(timeValue));
            } else if("type" in input && "payload" in input) {
                id = setInterval(() => this.send(input.type, input.payload), parseFloat(timeValue));
            }
        } else if(typeof timeValue === "function") {
            let firstPass = timeValue(...this._getDefaultArgs());

            type = Repeater.TimeType.FORMULAIC;
            id = setTimeout(() => {
                if(typeof input === "function") {
                    input(...this._getDefaultArgs());
                } else if(Array.isArray(input)) {
                    this.send(...input);
                } else if("type" in input && "payload" in input) {
                    this.send(input.type, input.payload);
                }

                this.clearTimeout(name);
                this.addInterval(input, timeValue, { name });
            }, firstPass);
        } else if(Array.isArray(timeValue)) {
            let [ min, max ] = timeValue;

            type = Repeater.TimeType.RANDOM;

            this.addInterval(input, () => Dice.random(min, max), { name });
        }

        if(id) {
            this.internal.Intervals[ name ] = {
                id,
                type,
                name
            };

            return name;
        }
        
        return false;
    }
    clearInterval(name) {
        clearInterval(this.internal.Intervals[ name ].id);
        delete this.internal.Intervals[ name ];

        return this;
    }

    _getDefaultArgs() {
        return {
            me: this,
            state: this.state
        };
    }
};