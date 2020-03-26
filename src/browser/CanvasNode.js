import { GenerateUUID } from "./helper";
import Node from "./Node";

export default class CanvasNode extends Node {
    static SignalTypes = {
        CLEAR: "CanvasNode.Clear",
        ERASE: "CanvasNode.Erase",
        ERASE_NGON: "CanvasNode.EraseNgon",

        CONTEXT_PROP: "CanvasNode.ContextProp",

        LOAD_IMAGE: "CanvasNode.LoadImage",
        LOAD_IMAGES: "CanvasNode.LoadImages",

        DRAW_CIRCLE: "CanvasNode.DrawCircle",
        DRAW_LINE: "CanvasNode.DrawLine",
        DRAW_RECTANGLE: "CanvasNode.DrawRectangle",
        DRAW_SQUARE: "CanvasNode.DrawSquare",
        DRAW_NGON: "CanvasNode.DrawNgon",
        DRAW_TEXT: "CanvasNode.DrawText",
        DRAW_IMAGE: "CanvasNode.DrawImage",
        DRAW_TILE: "CanvasNode.DrawTile",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(CanvasNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ canvas = null, ctx = null, draw = null, name = null, receive = null, parent = null, packager = null } = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this.state = {
            Canvas: canvas,
            Context: ctx || canvas ? canvas.getContext("2d") : null,
            Images: {},
            Draw: draw
        };
    }

    render() {
        if(window.requestAnimationFrame) {
            window.requestAnimationFrame((ts) => {
                this.draw(ts);
                
                this.render();
            });
        }
    }
    draw(...args) {
        if(typeof this.state.Draw === "function") {
            this.state.Draw.call(this, ...args);
        }

        return this;
    }
    setDraw(draw) {
        this.state.Draw = draw;

        return this;
    }

    setCanvas(canvas, ctx = "2d") {
        this.state.Canvas = canvas;
        this.state.Context = canvas.getContext(ctx);

        return this;
    }
    createCanvas({ ctx = "2d", parent = document.body, width = null, height = null } = {}) {
        let canvas = document.createElement("canvas");

        this.setCanvas(
            canvas,
            ctx
        );

        if(width && height) {
            this.resize(width, height);
        }

        if(parent instanceof Element) {
            parent.append(canvas);
        }

        return this;
    }
    

    get canvas() {
        return this.state.Canvas;
    }
    get ctx() {
        return this.state.Context;
    }

    loadImage(name, uri) {        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener("load", () => {
                this.state.Images[ name ] = img;
                resolve(img);
            });
            img.addEventListener("error", err => reject(err));
            img.src = uri;
        });
    }
    loadImages(arr) {
        let promises = arr.map(([ name, uri ]) => this.loadImage(name, uri));

        return Promise.all(promises);
    }

    get() {
        return this.state.Canvas;
    }
    getCenterPoint() {
        return [
            this.state.Canvas.width / 2,
            this.state.Canvas.height / 2
        ];
    }

    resize(width, height) {
        this.state.Canvas.width = width;
        this.state.Canvas.height = height;

        return this;
    }

    //* Erasure methods
    clear() {
        this.state.Context.clearRect(0, 0, this.state.Canvas.width, this.state.Canvas.height);

        return this;
    }
    erase(x, y, w, h) {
        this.state.Context.clearRect(x, y, w, h);

        return this;
    }
    eraseNgon(n, x, y, r, { rotation = 0 } = {}) {
        let pColor = this.state.Context.strokeStyle;
        let pBgColor = this.state.Context.fillStyle;

        this.state.Context.globalCompositeOperation = "destination-out";
        this.state.Context.fillStyle = "#fff";
        this.ngon(n, x, y, r, { rotation, isFilled: true });

        // Reset the composite and revert color
        this.state.Context.globalCompositeOperation = "source-over";
        this.state.Context.strokeStyle = pColor;
        this.state.Context.fillStyle = pBgColor;
    }

    
    //* Context meta methods
    prop(...props) {
        if(Array.isArray(props[ 0 ])) {
            props.forEach(([ prop, value ]) => {
                this.state.Context[ prop ] = value;
            });
        } else if(typeof props[ 0 ] === "object") {
            Object.entries(props[ 0 ]).forEach(([ prop, value ]) => {
                this.state.Context[ prop ] = value;
            });
        }

        return this;
    }

    
    //* Shape methods
    circle(x, y, r, { isFilled = false } = {}) {
        if(isFilled) {
            this.state.Context.beginPath();
            this.state.Context.arc(x, y, r, 0, 2 * Math.PI);
            this.state.Context.closePath();
            this.state.Context.fill();
            this.state.Context.stroke();
        } else {
            this.state.Context.beginPath();
            this.state.Context.arc(x, y, r, 0, 2 * Math.PI);
            this.state.Context.closePath();
            this.state.Context.stroke();
        }

        return this;
    }

    point(x, y) {
        return this.rect(x, y, 1, 1);
    }

    line(x0, y0, x1, y1) {
        this.state.Context.beginPath();
        this.state.Context.moveTo(x0, y0);
        this.state.Context.lineTo(x1, y1);
        this.state.Context.closePath();
        this.state.Context.stroke();

        return this;
    }

    rect(x, y, w, h, { isFilled = false } = {}) {
        this.state.Context.beginPath();
        if(isFilled) {
            this.state.Context.fillRect(x, y, w, h);
            this.state.Context.closePath();
            this.state.Context.fill();
            this.state.Context.stroke();
        } else {
            this.state.Context.rect(x, y, w, h);
            this.state.Context.closePath();
            this.state.Context.stroke();
        }

        return this;
    }

    square(x, y, { rc = null, rw = null, isFilled = false } = {}) {
        if(rc !== null) {
            this.rect(x, y, 2 * rc * Math.cos(Math.PI / 4), 2 * rc * Math.sin(Math.PI / 4), { isFilled });
        } else if(rw !== null) {
            this.rect(x, y, 2 * rw, 2 * rw, { isFilled });
        }
    }

    _getNgonCorner(x, y, r, i, v, rot = 0) {
        let deg = (360 / v) * i + rot;
        let rad = (Math.PI / 180) * deg;

        return [
            x + r * Math.cos(rad),
            y + r * Math.sin(rad),
        ];
    }
    ngon(n, x, y, r, { isFilled = false, rotation = 0 } = {}) {
        let corners = [];
        for (let i = 0; i < n; i++) {
            corners.push(this._getNgonCorner(x, y, r, i, n, rotation));
        }

        this.state.Context.beginPath();
        this.state.Context.moveTo(...corners[ 0 ]);
        corners.forEach((c, i) => {
            if(i < corners.length - 1) {
                this.state.Context.lineTo(...corners[i + 1]);
            }
        });
        this.state.Context.lineTo(...corners[ 0 ]);
        this.state.Context.closePath();

        if(isFilled) {
            // this.state.Context.closePath();
            this.state.Context.fill();
            this.state.Context.stroke();
        } else {
            this.state.Context.stroke();
        }

        return this;
    }

    text(txt, x, y, { align = "center", color = "#000", font = "10pt mono" } = {}) {
        let xn = x,
            yn = y;

        if(align) {
            this.state.Context.textAlign = align;
            this.state.Context.textBaseline = "middle";
        }

        let pColor = this.state.Context.fillStyle;
        this.state.Context.fillStyle = color;
        this.state.Context.font = font;
        this.state.Context.fillText(txt, xn, yn);
        this.state.Context.fillStyle = pColor;

        return this;
    }

    image(name, ...args) {
        this.state.Context.drawImage(this.state.Images[ name ], ...args);

        return this;
    }

    tile(name, size, sx, sy, dx, dy) {
        this.state.Context.drawImage(this.state.Images[ name ], sx, sy, size, size, dx, dy, size, size);

        return this;
    }
}