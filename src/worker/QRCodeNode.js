import QRCode from "qrcode";

import { GenerateUUID } from "./../helper";
import Node from "./../Node";
import CanvasNode from "./CanvasNode";

export default class QRCodeNode extends Node {
    static SignalTypes = {
        TO_DATA_URL: "QRCodeNode.ToDataUrl",
        TO_IMAGE: "QRCodeNode.ToImage",
        TO_CANVAS: "QRCodeNode.ToCanvas",
        TO_CANVAS_NODE: "QRCodeNode.ToCanvasNode",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(QRCodeNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, mnode = null, packager = null } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            mnode: mnode,
            packager: packager
        });

        this.internal = {
            LastDataUrl: null
        };
    }

    /**
     * Convert @input into a QRCode that is saved to `this.internal.LastDataUrl` and is sent via a TO_DATA_URL message
     * @param {string} input 
     * @param {obj} opts 
     */
    toDataUrl(input, opts = {}) {
        QRCode.toDataURL(input, opts, function(err, url) {
            this.internal.LastDataUrl = url;

            this.send(
                QRCodeNode.SignalTypes.TO_DATA_URL,
                url
            );
        });
    }

    toImage(input, opts = {}) {
        let image = new Image();

        QRCode.toDataURL(input, opts, function(err, url) {
            image.src = url;

            this.send(
                QRCodeNode.SignalTypes.TO_IMAGE,
                image
            );
        });
    }

    /**
     * Convert @input into a QRCode that is saved to @canvas and is sent via a T_CANVAS message
     * @param {string} input 
     * @param {DOMElement} canvas 
     * @param {obj} opts 
     */
    toCanvas(input, canvas, opts = {}) {
        if(canvas instanceof Element) {
            QRCode.toCanvas(canvas, input, opts, function(err) {
                this.send(
                    QRCodeNode.SignalTypes.TO_CANVAS,
                    canvas
                );
            });
        }
    }

    /**
     * If @canvasNode is not a CanvasNode, one will be created and returned
     * @param {CanvasNode} canvasNode 
     * @param {string} input 
     * @param {obj} opts 
     */
    toCanvasNode(canvasNode, input, opts = {}) {
        if(canvasNode instanceof CanvasNode) {
            this.toCanvas(input, canvasNode.canvas, opts);

            this.send(
                QRCodeNode.SignalTypes.TO_CANVAS_NODE,
                canvasNode.id
            );
        } else {
            let cn = new CanvasNode({
                canvas: document.createElement("canvas")
            });
            
            this.toCanvas(input, cn.canvas, opts);
            
            this.send(
                QRCodeNode.SignalTypes.TO_CANVAS_NODE,
                cn.id
            );

            return cn;
        }
    }
}