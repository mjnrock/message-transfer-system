import { Bitwise, GenerateUUID } from "./../../helper";
import Node from "./../../Node";
import Message from "./../../Message";

//! ------------------------------------------
//! Use the TESORO version atm, it is newer!
//! ------------------------------------------

export default class KeyboardNode extends Node {
    static SignalTypes = {
        KEY_MASK: "KeyboardNode.KeyMask",
        KEY_UP: "KeyboardNode.KeyUp",
        KEY_DOWN: "KeyboardNode.KeyDown",
        
        //* WIP, not currently implemented
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

    constructor({ name = null, keymap = null, keyflags = null, receive = null, parent = null, packager = null} = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });
        
        window.onkeydown = this.onKeyDown.bind(this);
        window.onkeyup = this.onKeyUp.bind(this);

        this.internal = {
            Map: keymap || {},
            Flags: keyflags || {},
            Mask: 0,
            Sequence: {
                Keys: [],
                Start: 0,
                Threshold: 300  // ms
            }
        };

        //*  Default: WASD/Arrows and Modifier keys
        if(Object.keys(this.internal.Map).length === 0 && Object.keys(this.internal.Flags).length === 0) {
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

    updateMask(e) {
        Object.keys(this.internal.Map).forEach(keyCode => {
            if(this.internal.Map[ keyCode ].includes(e.which)) {
                if(e.type === "keyup") {
                    this.internal.Mask = Bitwise.remove(this.internal.Mask, this.internal.Flags[ keyCode ]);
                } else if(e.type === "keydown") {
                    this.internal.Mask = Bitwise.add(this.internal.Mask, this.internal.Flags[ keyCode ]);
                }
            }
        });
        
        this.message(new Message(
            KeyboardNode.SignalTypes.KEY_MASK,
            this.internal.Mask,
            this.signet
        ));

        return this;
    }

    onKeyDown(e) {
        e.preventDefault();

        this.updateMask(e);        
        this.message(new Message(
            KeyboardNode.SignalTypes.KEY_DOWN,
            {
                mask: this.internal.Mask,
                key: e.which,
            },
            this.signet
        ));
    
        return this;
    }

    onKeyUp(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            KeyboardNode.SignalTypes.KEY_UP,
            {
                mask: this.internal.Mask,
                key: e.which,
            },
            this.signet
        ));
    
        return this;
    }

    

    /**
     * Always use UPPER CASE for the @name to ensure proper function creation
     * @param {string} name 
     * @param {number[]} keyCodes 
     * @param {number} flag 
     */
    registerKey(name, keyCodes, flag) {
        this.internal.Map[ name ] = Array.isArray(keyCodes) ? keyCodes : [ keyCodes ];
        this.internal.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ] = () => Bitwise.has(this.internal.Mask, this.internal.Flags[ name ]);   //* Adds a function "hasCamelCasedKey() => true|false"

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
        delete this.internal.Map[ name ];
        delete this.internal.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ];

        return this;
    }
}