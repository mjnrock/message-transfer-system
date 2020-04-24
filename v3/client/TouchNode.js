import { GenerateUUID } from "./../util/helper";
import Node from "./../Node";

export default class TouchNode extends Node {
    static SignalTypes = {
        TOUCH_MOVE: "TouchNode.TouchMove",
        TOUCH_START: "TouchNode.TouchStart",
        TOUCH_END: "TouchNode.TouchEnd",
        TOUCH_CANCEL: "TouchNode.TouchCancel",
        TOUCH_CLICK: "TouchNode.TouchClick",
        TOUCH_DOUBLE_CLICK: "TouchNode.TouchDoubleClick",
        TOUCH_MULTI: "TouchNode.TouchMulti",
        TOUCH_DETAIL: "TouchNode.TouchDetail",

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

    constructor({ name, element, receive, isPublic = false } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });
        
        window.addEventListener("load", () => {
            (element || window).addEventListener("touchstart", this.onTouchStart.bind(this));
            (element || window).addEventListener("touchend", this.onTouchEnd.bind(this));
            (element || window).addEventListener("touchmove", this.onTouchMove.bind(this));
            (element || window).addEventListener("touchcancel", this.onTouchCancel.bind(this));
        }, false);

        this.supply = {
            _config: {
                taps: {
                    threshold: 50
                },
                touch: {
                    thresholdX: 50,
                    thresholdY: 50
                },
                doubleClick: {
                    thresholdX: 50,
                    thresholdY: 50,
                    timeout: 350
                }
            },
            Click: [],
            DoubleClick: [],
            Touches: {},
            Taps: {
                touches: {},
                timestamp: null,
                timeout: null
            }
        };
        
        if(!(element || window)) {
            throw new Error("No element provided and Window is not supported");
        }
    }

    get config() {
        return this.supply._config;
    }
    set config(config) {
        this.supply._config = config;
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

        this.emit(
            TouchNode.SignalTypes.TOUCH_MOVE,
            touches,
        );
    
        return this;
    }
    onTouchStart(e) {
        e.preventDefault();

        if(e.touches.length === 1) {
            this.supply.Click = [
                e.touches[ 0 ].clientX,
                e.touches[ 0 ].clientY,
            ];

            if(!this.supply.DoubleClick.length) {
                this.supply.DoubleClick = [
                    e.touches[ 0 ].pageX,
                    e.touches[ 0 ].pageY,
                    Date.now()
                ];

                setTimeout(() => {
                    this.supply.DoubleClick = [];
                }, this.config.doubleClick.timeout);
            } else {
                this.supply.DoubleClick = [
                    ...this.supply.DoubleClick,
                    e.touches[ 0 ].pageX,
                    e.touches[ 0 ].pageY,
                    Date.now()
                ];
            }
        } else {
            this.supply.Click = [];
            this.supply.DoubleClick = [];
        }

        let touches = this.getTouches(e),
            now = Date.now();

        for(let touch of Object.values(touches.changed)) {
            this.supply.Touches[ touch.id ] = [ touch.x, touch.y, now ];
            this.supply.Taps.touches[ touch.id ] = {
                id: touch.id,
                x: touch.x,
                y: touch.y,
                timestamp: now
            };
            // this.internal.Taps.touches[ touch.id ] = touch;
        }

        this.emit(
            TouchNode.SignalTypes.TOUCH_START,
            touches,
        );
    
        return this;
    }
    onTouchEnd(e) {
        e.preventDefault();

        if(this.supply.Click.length) {
            this.emit(
                TouchNode.SignalTypes.TOUCH_CLICK,
                {
                    keys: {
                        ctrl: e.ctrlKey,
                        shift: e.shiftKey,
                        alt: e.altKey,
                        meta: e.metaKey,
                    },
                    x: this.supply.Click[ 0 ],
                    y: this.supply.Click[ 1 ]
                },
            );

            this.supply.Click = [];
        }

        if(this.supply.DoubleClick.length > 3) {
            let [ sx, sy, start, fx, fy, end ] = this.supply.DoubleClick,
                dx = Math.abs(sx - fx),
                dy = Math.abs(sy - fy);

            if((end - start <= this.config.doubleClick.timeout) && (dx <= this.config.doubleClick.thresholdX) && (dy <= this.config.doubleClick.thresholdY)) {
                this.emit(
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
                );
            }
            
            this.supply.DoubleClick = [];
        }

        let touches = this.getTouches(e),
            swipes = [],
            eventTypes = {};

        for(let touch of Object.values(touches.changed)) {
            if(this.supply.Touches[ touch.id ]) {
                let [ sx, sy ] = this.supply.Touches[ touch.id ],
                    [ fx, fy ] = [ touch.x, touch.y ],
                    dx = fx - sx,
                    dy = fy - sy,
                    dir = null;

                if(Math.abs(dx) >= this.config.touch.thresholdX || Math.abs(dy) >= this.config.touch.thresholdY) {
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
                    this.emit(...arr); 

                    swipes.push(arr);
                    if(!(eventName in eventTypes)) {
                        eventTypes[ eventName ] = 0;
                    }
                    eventTypes[ eventName ] += 1;
                }

                delete this.supply.Touches[ touch.id ];
            }
        }

        //TODO Taps needs a time delay window (like 50/100 ms maybe): the taps have to be like, EXACTLY at the same time for this to register multiple taps.
        //* This is REALLY sensitive to timing.  It DOES work, it's just difficult to actually get multiple taps to line up--they seriously need to be like EXACTLY simultaneously
        if(Object.keys(this.supply.Taps.touches).length > 1) {
            this.supply.Taps.timestamp = Date.now();
            this._endTaps();
        } else {
            this._clearTaps();
        }

        if(swipes.length > 1) {
            this.emit(
                TouchNode.SignalTypes.SWIPE_MULTI,
                {
                    touches: swipes.length,
                    counts: eventTypes,
                    swipes: swipes
                },
            );
        }

        this.emit(
            TouchNode.SignalTypes.TOUCH_END,
            touches,
        );
    
        return this;
    }

    _clearTaps() {
        clearTimeout(this.supply.Taps.timeout);

        this.supply.Taps = {
            touches: {},
            timestamp: null,
            timeout: null
        };
    }
    _endTaps() {
        if(Date.now() - this.supply.Taps.timestamp < this.config.taps.threshold) {
            clearTimeout(this.supply.Taps.timeout);
            this.supply.Taps.timeout = setTimeout(() => this._endTaps(), this.config.taps.threshold);
        } else {
            this.emit(
                TouchNode.SignalTypes.TOUCH_MULTI,
                {
                    count: Object.keys(this.supply.Taps.touches).length,
                    touches: Object.values(this.supply.Taps.touches)
                },
            );

            this._clearTaps();
        }
    }

    onTouchCancel(e) {
        e.preventDefault();

        let touches = this.getTouches(e);

        this.emit(
            TouchNode.SignalTypes.TOUCH_CANCEL,
            touches,
        );
    
        return this;
    }
}