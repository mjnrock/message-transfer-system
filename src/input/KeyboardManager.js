import { Bitwise, GenerateUUID } from "./../helper";
import Manager from "./../Manager";
import Message from "../Message";

//* @keymap and @keyflags should ALWAYS contain the same KEYS
export default class KeyboardManager extends Manager {
    static SignalTypes = {
        KEY_MASK: "KeyboardManager.KeyMask",
        KEY_UP: "KeyboardManager.KeyUp",
        KEY_DOWN: "KeyboardManager.KeyDown",
    };

    constructor(window, { keymap = null, keyflags = null, receive = null, parent = null, packager = null} = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });
        
        window.onkeydown = this.onKeyDown.bind(this);
        window.onkeyup = this.onKeyUp.bind(this);

        this.Window = window;

        this.state = {
            Map: keymap,
            Flags: keyflags,
            Mask: 0
        };

        //*  Default: WASD/Arrows and Modifier keys
        if(!this.state.Map && !this.state.Flags) {
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
    }

    updateMask(e) {
        Object.keys(this.state.Map).forEach(keyCode => {
            if(this.state.Map[ keyCode ].includes(e.which)) {
                if(e.type === "keyup") {
                    this.state.Mask = Bitwise.remove(this.state.Mask, this.state.Flags[ keyCode ]);
                } else if(e.type === "keydown") {
                    this.state.Mask = Bitwise.add(this.state.Mask, this.state.Flags[ keyCode ]);
                }
            }
        });
        
        this.message(new Message(
            KeyboardManager.SignalTypes.KEY_MASK,
            keymask,
            this.signet
        ));

        return this;
    }

    onKeyDown(e) {
        e.preventDefault();

        this.updateMask(e);        
        this.message(new Message(
            KeyboardManager.SignalTypes.KEY_DOWN,
            e.which,
            this.signet
        ));
    
        return this;
    }

    onKeyUp(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            KeyboardManager.SignalTypes.KEY_UP,
            e.which,
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
        this.state.Map[ name ] = Array.isArray(keyCodes) ? keyCodes : [ keyCodes ];
        this.state.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ] = () => Bitwise.has(this.state.Mask, this.state.Flags[ name ]);   //* Adds a function "hasCamelCasedKey() => true|false"

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
        delete this.state.Map[ name ];
        delete this.state.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ];

        return this;
    }
}