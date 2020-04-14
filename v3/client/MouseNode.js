import { Bitwise, GenerateUUID } from "./../util/helper";
import Node from "./../Node";

export default class MouseNode extends Node {
    static SignalTypes = {
        //* Singleton Actions
        MOUSE_CLICK: "MouseNode.MouseClick",
        MOUSE_DOUBLE_CLICK: "MouseNode.MouseDoubleClick",
        MOUSE_CONTEXT_MENU: "MouseNode.MouseContextMenu",
        MOUSE_UP: "MouseNode.MouseUp",
        MOUSE_DOWN: "MouseNode.MouseDown",

        SWIPE_UP: "MouseNode.SwipeUp",
        SWIPE_DOWN: "MouseNode.SwipeDown",
        SWIPE_LEFT: "MouseNode.SwipeLeft",
        SWIPE_RIGHT: "MouseNode.SwipeRight",

        //* Complex Actions
        MOUSE_MASK: "MouseNode.MouseMask",
        MOUSE_MOVE: "MouseNode.MouseMove",
        MOUSE_SELECTION: "MouseNode.MouseSelection",
        MOUSE_PATH: "MouseNode.MousePath",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(MouseNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name, btnmap, btnflags, receive, isPublic = false } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });
        
        window.onmousedown = this.onMouseDown.bind(this);
        window.onmouseup = this.onMouseUp.bind(this);
        window.onmousemove = this.onMouseMove.bind(this);
        window.onclick = this.onClick.bind(this);
        window.ondblclick = this.onDblClick.bind(this);
        window.oncontextmenu = this.onContextMenu.bind(this);

        this.supply = {
            Map: btnmap || {},
            Flags: btnflags || {},
            Mask: 0,
            Selection: {},
            Path: {},
            Swipe: {},
            emitComplexActions: false
        };

        //*  Default: Left/Right/Middle
        if(Object.keys(this.supply.Map).length === 0 && Object.keys(this.supply.Flags).length === 0) {
            this.registerButtons([
                [ "LEFT", [ 0 ], 2 << 0 ],
                [ "MIDDLE", [ 1 ], 2 << 1 ],
                [ "RIGHT", [ 2 ], 2 << 2 ],
            ]);
        }
        
        if(!window) {
            throw new Error("Window is not supported");
        }
    }

    toggleComplexActions() {
        this.supply.emitComplexActions = !this.supply.emitComplexActions;

        return this;
    }

    _startSwipe(button, x, y, timeout = 750, threshold = 75) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            button: button,
            start: [ x, y ],
            timestamp: Date.now(),
            threshold: {
                position: threshold,
                time: timeout
            },
            timeout: setTimeout(() => this._clearSwipe(button), timeout)
        };
        
        this.supply.Swipe[ button ] = obj;
    }
    _endSwipe(button, x, y) {
        let swipe = this.supply.Swipe[ button ];

        if(swipe && (Date.now() - swipe.timestamp <= swipe.threshold.time)) {
            let [ sx, sy ] = swipe.start,
                dx = x - sx,
                dy = y - sy,
                dir = null;

            if(Math.abs(dx) > swipe.threshold.position || Math.abs(dy) > swipe.threshold.position) {
                if(Math.abs(dx) > Math.abs(dy)) {
                    if(dx > 0) {
                        dir = "RIGHT";
                    } else {
                        dir = "LEFT";
                    }
                } else {
                    if(dy > 0) {
                        dir = "DOWN";
                    } else {
                        dir = "UP";
                    }
                }
                
                this.emit(
                    MouseNode.SignalTypes[ `SWIPE_${ dir.toUpperCase() }`],
                    {
                        button: swipe.button,
                        mask: this.supply.Mask,
                        points: {
                            start: swipe.start,
                            end: [ x, y ]
                        }
                    }
                );                
            }

            this._clearSwipe(button);
        }
    }
    _clearSwipe(button) {
        if(this.supply.Swipe[ button ]) {
            clearTimeout(this.supply.Swipe[ button ].timeout);
            delete this.supply.Swipe[ button ];
        }
    }

    _startPath(button, x, y, timeout = 2000) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            button: button,
            points: [
                [ x, y ]
            ],
            timeout: setTimeout(() => this._endPath(button), timeout)
        };
        
        this.supply.Path[ button ] = obj;
    }
    _addPath(button, x, y, timeout = 2000) {
        this.supply.Path[ button ].points.push([ x, y ]);
        
        clearTimeout(this.supply.Path[ button ].timeout);
        this.supply.Path[ button ].timeout = setTimeout(() => this._endPath(button), timeout);
    }
    _endPath(button) {
        let path = this.supply.Path[ button ];

        if(path) {
            this.emit(
                MouseNode.SignalTypes.MOUSE_PATH,
                {
                    button: path.button,
                    mask: this.supply.Mask,
                    points: path.points
                }
            );

            clearTimeout(path.timeout);

            delete this.supply.Path[ button ];
        }
    }

    _startSelection(button, x, y, timeout = 5000, threshold = 20) {
        let id = GenerateUUID();

        let obj = {
            id: id,
            button: button,
            points: {
                start: [ x, y ],
                end: []
            },
            threshold: threshold,
            timeout: setTimeout(() => this._endSelection(button), timeout)
        };
        
        this.supply.Selection[ button ] = obj;
    }
    _endSelection(button) {
        let selection = this.supply.Selection[ button ];

        if(selection) {
            if(selection.points.end.length) {
                let size = {
                    width: selection.points.end[ 0 ] - selection.points.start[ 0 ],
                    height: selection.points.end[ 1 ] - selection.points.start[ 1 ],
                    threshold: selection.threshold
                }

                if(Math.abs(size.width) >= selection.threshold && Math.abs(size.height) >= selection.threshold) {
                    this.emit(
                        MouseNode.SignalTypes.MOUSE_SELECTION,
                        {
                            button: selection.button,
                            mask: this.supply.Mask,
                            start: selection.points.start,
                            end: selection.points.end,
                            size: size,
                        }
                    );
                }
            }

            clearTimeout(selection.timeout);

            delete this.supply.Selection[ button ];
        }
    }

    updateMask(e) {
        Object.keys(this.supply.Map).forEach(btnCode => {
            if(this.supply.Map[ btnCode ].includes(e.button)) {
                if(e.type === "mouseup") {
                    this.supply.Mask = Bitwise.remove(this.supply.Mask, this.supply.Flags[ btnCode ]);
                } else if(e.type === "mousedown") {
                    this.supply.Mask = Bitwise.add(this.supply.Mask, this.supply.Flags[ btnCode ]);
                }
            }
        });

        if(this.supply.emitComplexActions === true) {
            this.emit(
                MouseNode.SignalTypes.MOUSE_MASK,
                this.supply.Mask,
            );
        }

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
        if(this.supply.emitComplexActions === true) {        
            let pos = this.getMousePosition(e);
            this.emit(
                MouseNode.SignalTypes.MOUSE_MOVE,
                {
                    mask: this.supply.Mask,
                    ...pos
                },
            );

            for(let path of Object.values(this.supply.Path)) {
                this._addPath(
                    path.button,
                    pos.x,
                    pos.y
                );
            }
        }
    
        return this;
    }
    onMouseDown(e) {
        e.preventDefault();

        this.updateMask(e);

        let pos = this.getMousePosition(e);
        this.emit(
            MouseNode.SignalTypes.MOUSE_DOWN,
            {
                button: e.button,
                mask: this.supply.Mask,
                ...pos
            },
        );
        
        if(!this.supply.Swipe[ e.button ]) {
            this._startSwipe(
                e.button,
                pos.x,
                pos.y
            );
        }

        if(this.supply.emitComplexActions === true) {
            if(!this.supply.Selection[ e.button ]) {
                this._startSelection(
                    e.button,
                    pos.x,
                    pos.y
                );
            }
            if(!this.supply.Path[ e.button ]) {
                this._startPath(
                    e.button,
                    pos.x,
                    pos.y
                );
            }
        }
    
        return this;
    }
    onMouseUp(e) {
        e.preventDefault();

        this.updateMask(e);
        
        let pos = this.getMousePosition(e);
        this.emit(
            MouseNode.SignalTypes.MOUSE_UP,
            {
                button: e.button,
                mask: this.supply.Mask,
                ...pos
            },
        );
        
        if(this.supply.Swipe[ e.button ]) {
            this._endSwipe(
                e.button,
                pos.x,
                pos.y
            );
        }

        if(this.supply.emitComplexActions === true) {
            if(this.supply.Selection[ e.button ]) {
                this.supply.Selection[ e.button ].points.end = [ pos.x, pos.y ];
                this._endSelection(
                    e.button
                );
            }
            if(this.supply.Path[ e.button ]) {
                this._endPath(
                    e.button
                );
            }
        }
    
        return this;
    }
    onClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.emit(
            MouseNode.SignalTypes.MOUSE_CLICK,
            {
                button: e.button,
                mask: this.supply.Mask,
                ...this.getMousePosition(e)
            },
        );
    
        return this;
    }
    onDblClick(e) {
        e.preventDefault();

        this.updateMask(e);
        this.emit(
            MouseNode.SignalTypes.MOUSE_DOUBLE_CLICK,
            this.getMousePosition(e),
        );
    
        return this;
    }
    onContextMenu(e) {
        e.preventDefault();

        this.updateMask(e);
        this.emit(
            MouseNode.SignalTypes.MOUSE_CONTEXT_MENU,
            this.getMousePosition(e),
        );
    
        return this;
    }

    /**
     * Always use UPPER CASE for the @name to ensure proper function creation
     * @param {string} name 
     * @param {number[]} btnCodes 
     * @param {number} flag 
     */
    registerButton(name, btnCodes, flag) {
        this.supply.Map[ name ] = Array.isArray(btnCodes) ? btnCodes : [ btnCodes ];
        this.supply.Flags[ name ] = flag;

        this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ] = () => Bitwise.has(this.supply.Mask, this.supply.Flags[ name ]);   //* Adds a function "hasCamelCasedButton() => true|false"

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
        delete this.supply.Map[ name ];
        delete this.supply.Flags[ name ];

        delete this[ `has${ (name.toLowerCase()).charAt(0).toUpperCase() + name.slice(1) }` ];

        return this;
    }
}