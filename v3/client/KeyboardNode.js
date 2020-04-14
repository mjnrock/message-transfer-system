import { Bitwise, GenerateUUID } from "./../util/helper";
import Node from "./../Node";

export default class KeyboardNode extends Node {
    static SignalTypes = {
        KEY_MASK: "KeyboardNode.KeyMask",
        KEY_UP: "KeyboardNode.KeyUp",
        KEY_DOWN: "KeyboardNode.KeyDown",
        KEY_SEQUENCE: "KeyboardNode.KeySequence",   // Record all key UPs within a time threshold | Fire if threshold is exceeded, reset if UP happens
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(KeyboardNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name, keymap, keyflags, receive, isPublic = false } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });
        
        window.onkeydown = this.onKeyDown.bind(this);
        window.onkeyup = this.onKeyUp.bind(this);

        this.supply = {
            Map: keymap || {},
            Flags: keyflags || {},
            Mask: 0,
            Sequence: null
        };

        //*  Default: WASD/Arrows and Modifier keys
        if(Object.keys(this.supply.Map).length === 0 && Object.keys(this.supply.Flags).length === 0) {
            this.registerKeys([
                [ "UP", [ 87, 38 ], 2 << 0 ],
                [ "DOWN", [ 83, 40 ], 2 << 1 ],
                [ "LEFT", [ 65, 37 ], 2 << 2 ],
                [ "RIGHT", [ 68, 39 ], 2 << 3 ],

                [ "SHIFT", [ 16 ], 2 << 4 ],
                [ "ALT", [ 18 ], 2 << 5 ],
                [ "CTRL", [ 17 ], 2 << 6 ],
            ]);
        }
        
        if(!window) {
            throw new Error("Window is not supported");
        }
    }

    _startSequence(key, timeout = 750, minLength = 3, maxLength = 10) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            keys: [ {
                key: key,
                timestamp: Date.now()
            } ],
            length: {
                min: minLength,
                max: maxLength
            },
            timeout: setTimeout(() => this._endSequence(), timeout)
        };
        
        this.supply.Sequence = obj;
    }
    _addSequence(key) {
        if(this.supply.Sequence) {
            this.supply.Sequence.keys.push({
                key: key,
                timestamp: Date.now()
            });

            if(this.supply.Sequence.keys.length === this.supply.Sequence.length.max) {
                this._endSequence();
            }
        }
    }
    _endSequence() {        
        let sequence = this.supply.Sequence;

        if(sequence && (sequence.keys.length >= sequence.length.min && sequence.keys.length <= sequence.length.max)) {
            this.emit(
                KeyboardNode.SignalTypes.KEY_SEQUENCE,
                {
                    keys: sequence.keys,
                    length: sequence.keys.length,
                    timespan: sequence.keys[ sequence.keys.length - 1 ].timestamp - sequence.keys[ 0 ].timestamp
                }
            );
        }

        clearTimeout(sequence.timeout);
        this.supply.Sequence = null;
    }

    updateMask(e) {
        Object.keys(this.supply.Map).forEach(keyCode => {
            if(this.supply.Map[ keyCode ].includes(e.which)) {
                if(e.type === "keyup") {
                    this.supply.Mask = Bitwise.remove(this.supply.Mask, this.supply.Flags[ keyCode ]);
                } else if(e.type === "keydown") {
                    this.supply.Mask = Bitwise.add(this.supply.Mask, this.supply.Flags[ keyCode ]);
                }
            }
        });

        this.emit(
            KeyboardNode.SignalTypes.KEY_MASK,
            this.supply.Mask,
        );

        return this;
    }

    onKeyDown(e) {
        e.preventDefault();

        this.updateMask(e);
        this.emit(
            KeyboardNode.SignalTypes.KEY_DOWN,
            {
                mask: this.supply.Mask,
                key: e.which,
            },
        );
    
        return this;
    }

    onKeyUp(e) {
        e.preventDefault();

        this.updateMask(e);
        this.emit(
            KeyboardNode.SignalTypes.KEY_UP,
            {
                mask: this.supply.Mask,
                key: e.which,
            },
        );

        if(this.supply.Sequence) {
            this._addSequence(e.which);
        } else {
            this._startSequence(e.which);
        }
    
        return this;
    }

    

    /**
     * Always use UPPER CASE for the @name to ensure proper function creation
     * @param {string} name 
     * @param {number[]} keyCodes 
     * @param {number} flag 
     */
    registerKey(name, keyCodes, flag) {
        this.supply.Map[ name ] = Array.isArray(keyCodes) ? keyCodes : [ keyCodes ];
        this.supply.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ] = () => Bitwise.has(this.supply.Mask, this.supply.Flags[ name ]);   //* Adds a function "hasCamelCasedKey() => true|false"

        return this;
    }
    /**
     * A helper function to allow for quicker registration of multiple keys
     * @param {Array<[string, number[], number]} array 
     */
    registerKeys(array) {
        array.forEach(([ name, keyCodes, flag ]) => {
            this.registerKey(name, keyCodes, flag);
        });

        return this;
    }
    /**
     * Always use UPPER CASE for the @name to ensure proper function destruction
     * @param {string} name 
     */
    unregisterKey(name) {
        delete this.supply.Map[ name ];
        delete this.supply.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ];

        return this;
    }
}