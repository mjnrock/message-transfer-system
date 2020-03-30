import { GenerateUUID } from "./../../helper";
import Node from "./../../Node";
import Message from "./../../Message";

export default class TouchNode extends Node {
    static SignalTypes = {
        TOUCH_MOVE: "TouchNode.TouchMove",
        TOUCH_START: "TouchNode.TouchStart",
        TOUCH_END: "TouchNode.TouchEnd",
        TOUCH_CANCEL: "TouchNode.TouchCancel",
        TOUCH_CLICK: "TouchNode.TouchClick",
        TOUCH_DOUBLE_CLICK: "TouchNode.TouchDoubleClick",
        TOUCH_TAPS: "TouchNode.TouchTaps",

        SWIPE_UP: "TouchNode.SwipeUp",
        SWIPE_DOWN: "TouchNode.SwipeDown",
        SWIPE_LEFT: "TouchNode.SwipeLeft",
        SWIPE_RIGHT: "TouchNode.SwipeRight",
        SWIPE_MULTI: "TouchNode.SwipeMulti",

        //* WIP, not yet implemented
        PINCH: "TouchNode.Pinch",
        ZOOM: "TouchNode.Zoom",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(TouchNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, parent = null, packager = null} = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });
        
        window.addEventListener("load", () => {
            window.addEventListener("touchstart", this.onTouchStart.bind(this));
            window.addEventListener("touchend", this.onTouchEnd.bind(this));
            window.addEventListener("touchmove", this.onTouchMove.bind(this));
            window.addEventListener("touchcancel", this.onTouchCancel.bind(this));
        }, false);

        this.internal = {
            Click: [],
            DoubleClick: [],
            Touches: {}
        };
        
        if(!window) {
            throw new Error("Window is not supported");
        }
    }

    getTouches(e) {
        let touches = {},
            target = {},
            changed = {};

        Array.from(e.touches).forEach((touch, i) => {
            touches[ i ] = {
                id: touch.identifier,
                x: touch.clientX,   // no offsets accounted for
                y: touch.clientY,
                pos: {
                    sx: touch.screenX,
                    sy: touch.screenY,
                    px: touch.pageX,
                    py: touch.pageY,
                    cx: touch.clientX,
                    cy: touch.clientY,
                },
                radius: {
                    x: touch.radiusX,
                    y: touch.radiusY,
                    theta: touch.rotationAngle,
                    force: touch.force,
                },
                // x: touch.pageX,  // with offsets accounted for
                // y: touch.pageY,
                timestamp: Date.now(),
                // target: {
                //     type: touch.target.tagName.toLowerCase(),
                //     position: touch.target.getBoundingClientRect(),
                //     id: touch.target.id,
                //     class: touch.target.className,
                //     ref: touch.target,
                // },
            }
        });
        Array.from(e.changedTouches).forEach((touch, i) => {
            changed[ i ] = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                pos: {
                    sx: touch.screenX,
                    sy: touch.screenY,
                    px: touch.pageX,
                    py: touch.pageY,
                    cx: touch.clientX,
                    cy: touch.clientY,
                },
                radius: {
                    x: touch.radiusX,
                    y: touch.radiusY,
                    theta: touch.rotationAngle,
                    force: touch.force,
                },
                // x: touch.pageX,
                // y: touch.pageY,
                timestamp: Date.now(),
                // target: {
                //     type: touch.target.tagName.toLowerCase(),
                //     position: touch.target.getBoundingClientRect(),
                //     id: touch.target.id,
                //     class: touch.target.className,
                //     ref: touch.target,
                // },
            }
        });
        Array.from(e.targetTouches).forEach((touch, i) => {
            target[ i ] = {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                pos: {
                    sx: touch.screenX,
                    sy: touch.screenY,
                    px: touch.pageX,
                    py: touch.pageY,
                    cx: touch.clientX,
                    cy: touch.clientY,
                },
                radius: {
                    x: touch.radiusX,
                    y: touch.radiusY,
                    theta: touch.rotationAngle,
                    force: touch.force,
                },
                // x: touch.pageX,
                // y: touch.pageY,
                timestamp: Date.now(),
                // target: {
                //     type: touch.target.tagName.toLowerCase(),
                //     position: touch.target.getBoundingClientRect(),
                //     id: touch.target.id,
                //     class: touch.target.className,
                //     ref: touch.target,
                // },
            }
        });

        return {
            keys: {
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey,
            },
            rotation: e.rotation,
            scale: e.scale,
            touches,
            target,
            changed
        };
    }

    onTouchMove(e) {
        e.preventDefault();

        let touches = this.getTouches(e);

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_MOVE,
            touches,
            this.signet
        ));
    
        return this;
    }
    onTouchStart(e) {
        e.preventDefault();

        if(e.touches.length === 1) {
            this.internal.Click = [
                e.touches[ 0 ].clientX,
                e.touches[ 0 ].clientY,
            ];

            if(!this.internal.DoubleClick.length) {
                this.internal.DoubleClick = [
                    e.touches[ 0 ].pageX,
                    e.touches[ 0 ].pageY,
                    Date.now()
                ];

                setTimeout(() => {
                    this.internal.DoubleClick = [];
                }, 350);
            } else {
                this.internal.DoubleClick = [
                    ...this.internal.DoubleClick,
                    e.touches[ 0 ].pageX,
                    e.touches[ 0 ].pageY,
                    Date.now()
                ];
            }
        } else {
            this.internal.Click = [];
            this.internal.DoubleClick = [];
        }

        let touches = this.getTouches(e);

        for(let touch of Object.values(touches.changed)) {
            this.internal.Touches[ touch.id ] = [ touch.x, touch.y ];
        }

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_START,
            touches,
            this.signet
        ));
    
        return this;
    }
    onTouchEnd(e) {
        e.preventDefault();

        if(this.internal.Click.length) {
            this.message(new Message(
                TouchNode.SignalTypes.TOUCH_CLICK,
                {
                    keys: {
                        ctrl: e.ctrlKey,
                        shift: e.shiftKey,
                        alt: e.altKey,
                        meta: e.metaKey,
                    },
                    x: this.internal.Click[ 0 ],
                    y: this.internal.Click[ 1 ]
                },
                this.signet
            ));

            this.internal.Click = [];
        }

        if(this.internal.DoubleClick.length > 3) {
            let [ sx, sy, start, fx, fy, end ] = this.internal.DoubleClick,
                dx = Math.abs(sx - fx),
                dy = Math.abs(sy - fy);

            if((end - start <= 350) && (dx <= 50) && (dy <= 50)) {
                this.message(new Message(
                    TouchNode.SignalTypes.TOUCH_DOUBLE_CLICK,
                    {
                        keys: {
                            ctrl: e.ctrlKey,
                            shift: e.shiftKey,
                            alt: e.altKey,
                            meta: e.metaKey,
                        },
                        x: sx,
                        y: sy,
                        detail: {
                            sx: sx,
                            sy: sy,
                            fx: fx,
                            fy: fy,
                            start: start,
                            end: end,
                            time: end - start
                        }
                    },
                    this.signet
                ));
            }
            
            this.internal.DoubleClick = [];
        }

        let touches = this.getTouches(e),
            swipes = [],
            eventTypes = {},
            taps = [];

        for(let touch of Object.values(touches.changed)) {
            if(this.internal.Touches[ touch.id ]) {
                let [ sx, sy ] = this.internal.Touches[ touch.id ],
                    [ fx, fy ] = [ touch.x, touch.y ],
                    dx = fx - sx,
                    dy = fy - sy,
                    dir = null;

                taps.push({
                    id: touch.id,
                    points: {
                        start: [ sx, sy ],
                        end: [ fx, fy ],
                        delta: [ dx, dy ]
                    }
                });

                if(Math.abs(dx) >= 50 || Math.abs(dy) >= 50) {
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
                
                    let eventName = `SWIPE_${ dir.toUpperCase() }`;
                    let arr = [
                        TouchNode.SignalTypes[ eventName ],
                        {
                            id: touch.id,
                            points: {
                                start: [ sx, sy ],
                                end: [ fx, fy ],
                                delta: [ dx, dy ]
                            }
                        }
                    ]
                    this.send(...arr); 

                    swipes.push(arr);
                    if(!(eventName in eventTypes)) {
                        eventTypes[ eventName ] = 0;
                    }
                    eventTypes[ eventName ] += 1;
                }

                delete this.internal.Touches[ touch.id ];
            }
        }

        //TODO Taps needs a time delay window (like 50/100 ms maybe): the taps have to be like, EXACTLY at the same time for this to register multiple taps.
        //* This is REALLY sensitive to timing.  It DOES work, it's just difficult to actually get multiple taps to line up--they seriously need to be like EXACTLY simultaneously
        if(taps.length) {
            this.message(new Message(
                TouchNode.SignalTypes.TOUCH_TAPS,
                {
                    touches: taps.length,
                    taps: taps
                },
                this.signet
            ));
        }

        if(swipes.length > 1) {
            this.message(new Message(
                TouchNode.SignalTypes.SWIPE_MULTI,
                {
                    touches: swipes.length,
                    counts: eventTypes,
                    swipes: swipes
                },
                this.signet
            ));
        }

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_END,
            touches,
            this.signet
        ));
    
        return this;
    }

    onTouchCancel(e) {
        e.preventDefault();

        let touches = this.getTouches(e);

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_CANCEL,
            touches,
            this.signet
        ));
    
        return this;
    }
}