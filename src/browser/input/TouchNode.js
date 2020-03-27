import { GenerateUUID } from "../../helper";
import Node from "../../Node";
import Message from "../../Message";

export default class TouchNode extends Node {
    static SignalTypes = {
        TOUCH_MOVE: "TouchNode.TouchMove",
        TOUCH_START: "TouchNode.TouchStart",
        TOUCH_END: "TouchNode.TouchEnd",
        TOUCH_CANCEL: "TouchNode.TouchCancel",

        //* WIP, not yet implemented
        SWIPE_UP: "TouchNode.SwipeUp",          // Needs to have number of touches (e.g. 1-finger, 2-finger, etc.)
        SWIPE_DOWN: "TouchNode.SwipeDown",      // Needs to have number of touches (e.g. 1-finger, 2-finger, etc.)
        SWIPE_LEFT: "TouchNode.SwipeLeft",      // Needs to have number of touches (e.g. 1-finger, 2-finger, etc.)
        SWIPE_RIGHT: "TouchNode.SwipeRight",    // Needs to have number of touches (e.g. 1-finger, 2-finger, etc.)
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

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_MOVE,
            this.getTouches(e),
            this.signet
        ));
    
        return this;
    }
    onTouchStart(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_START,
            this.getTouches(e),
            this.signet
        ));
    
        return this;
    }
    onTouchEnd(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_END,
            this.getTouches(e),
            this.signet
        ));
    
        return this;
    }

    onTouchCancel(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_CANCEL,
            this.getTouches(e),
            this.signet
        ));
    
        return this;
    }
}