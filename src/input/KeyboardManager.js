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

        this.Handlers = {
            onKeyMask: mask,
            onKeyDown: down,
            onKeyUp: up
        };

        this.Keys = {
            Map: keymap,
            Flags: keyflags
        };
        this.Mask = 0;

        if(!this.Keys.Map && !this.Keys.Flags) {
            //  Default: WASD/Arrows and Modifier keys
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
        Object.keys(this.Keys.Map).forEach(keyCode => {
            if(this.Keys.Map[ keyCode ].includes(e.which)) {
                if(e.type === "keyup") {
                    this.Mask = Bitwise.remove(this.Mask, this.Keys.Flags[ keyCode ]);
                } else if(e.type === "keydown") {
                    this.Mask = Bitwise.add(this.Mask, this.Keys.Flags[ keyCode ]);
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
        this.Keys.Map[ name ] = Array.isArray(keyCodes) ? keyCodes : [ keyCodes ];
        this.Keys.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ] = () => Bitwise.has(this.Mask, this.Keys.Flags[ name ]);   //* Adds a function "hasCamelCasedKey() => true|false"

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
        delete this.Keys.Map[ name ];
        delete this.Keys.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ];

        return this;
    }
}