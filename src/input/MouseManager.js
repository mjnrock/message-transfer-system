import { Bitwise, GenerateUUID } from "../helper";
import Manager from "../Manager";
import Message from "../Message";

export default class MouseManager extends Manager {
    static SignalTypes = {
        MOUSE_MASK: "MouseManager.MouseMask",
        MOUSE_MOVE: "MouseManager.MouseMove",
        MOUSE_CLICK: "MouseManager.MouseClick",
        MOUSE_DOUBLE_CLICK: "MouseManager.MouseDoubleClick",
        MOUSE_CONTEXT_MENU: "MouseManager.MouseContextMenu",
        MOUSE_UP: "MouseManager.MouseUp",
        MOUSE_DOWN: "MouseManager.MouseDown",
    };

    constructor(window, { btnmap = null, btnflags = null, receive = null, parent = null, packager = null} = {}) {
        super(GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });
        
        window.onmousedown = this.onMouseDown.bind(this);
        window.onmouseup = this.onMouseUp.bind(this);
        window.onmousemove = this.onMouseMove.bind(this);
        window.onclick = this.onClick.bind(this);
        window.ondblclick = this.onDblClick.bind(this);
        window.oncontextmenu = this.onContextMenu.bind(this);

        this.Window = window;

        this.Buttons = {
            Map: btnmap,
            Flags: btnflags
        };
        this.Mask = 0;

        if(!this.Buttons.Map && !this.Buttons.Flags) {
            //  Default: Left/Right/Middle
            this.registerButtons([
                [ "LEFT", [ 0 ], 2 << 0 ],
                [ "MIDDLE", [ 1 ], 2 << 1 ],
                [ "RIGHT", [ 2 ], 2 << 2 ],
            ]);
        }
    }

    updateMask(e) {
        Object.keys(this.Buttons.Map).forEach(btnCode => {
            if(this.Buttons.Map[ btnCode ].includes(e.button)) {
                if(e.type === "mouseup") {
                    this.Mask = Bitwise.remove(this.Mask, this.Buttons.Flags[ btnCode ]);
                } else if(e.type === "mousedown") {
                    this.Mask = Bitwise.add(this.Mask, this.Buttons.Flags[ btnCode ]);
                }
            }
        });

        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_MASK,
            this.Mask,
            this.signet
        ));

        return this;
    }

    getMousePosition(e) {
        return {
            x: e.x,
            y: e.y
        };
    }

    onMouseMove(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_MOVE,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onMouseDown(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_DOWN,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onMouseUp(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_UP,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_CLICK,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onDblClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_DOUBLE_CLICK,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }
    onContextMenu(e) {
        e.preventDefault();

        this.updateMask(e);
        this.message(new Message(
            MouseManager.SignalTypes.MOUSE_CONTEXT_MENU,
            this.getMousePosition(e),
            this.signet
        ));
    
        return this;
    }

    /**
     * Always use UPPER CASE for the @name to ensure proper function creation
     * @param {string} name 
     * @param {number[]} btnCodes 
     * @param {number} flag 
     */
    registerButton(name, btnCodes, flag) {
        this.Buttons.Map[ name ] = Array.isArray(btnCodes) ? btnCodes : [ btnCodes ];
        this.Buttons.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ] = () => Bitwise.has(this.Mask, this.Buttons.Flags[ name ]);   //* Adds a function "hasCamelCasedButton() => true|false"

        return this;
    }
    /**
     * A helper function to allow for quicker registration of multiple buttons
     * @param {Array<[string, number[], number]} array 
     */
    registerButtons(array) {
        array.forEach(([ name, btnCodes, flag ]) => {
            this.registerButton(name, btnCodes, flag);
        });

        return this;
    }
    /**
     * Always use UPPER CASE for the @name to ensure proper function destruction
     * @param {string} name 
     */
    unregisterButton(name) {
        delete this.Buttons.Map[ name ];
        delete this.Buttons.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + s.slice(1) }` ];

        return this;
    }
}