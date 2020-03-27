import { GenerateUUID } from "../../helper";
import Node from "../../Node";
import Message from "../../Message";

export default class TouchNode extends Node {
    static SignalTypes = {
        TOUCH_MOVE: "TouchNode.TouchMove",
        TOUCH_START: "TouchNode.TouchStart",
        TOUCH_END: "TouchNode.TouchEnd",
        TOUCH_CANCEL: "TouchNode.TouchCancel"
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
        
        window.ontouchstart = this.onTouchStart.bind(this);
        window.ontouchend = this.onTouchEnd.bind(this);
        window.ontouchmove = this.onTouchMove.bind(this);
        window.ontouchcancel = this.onTouchCancel.bind(this);

        this.internal = {
            Touches: {}
        };
        
        if(!window) {
            throw new Error("Window is not supported");
        }
    }

    getTouchPosition(e) {
        return {
            x: e.x,
            y: e.y
        };
    }

    onTouchMove(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_MOVE,
            e,
            this.signet
        ));
    
        return this;
    }
    onTouchStart(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_START,
            e,
            this.signet
        ));
    
        return this;
    }
    onTouchEnd(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_END,
            e,
            this.signet
        ));
    
        return this;
    }

    onTouchCancel(e) {
        e.preventDefault();

        this.message(new Message(
            TouchNode.SignalTypes.TOUCH_CANCEL,
            e,
            this.signet
        ));
    
        return this;
    }
}