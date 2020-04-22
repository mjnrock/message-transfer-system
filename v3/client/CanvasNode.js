import { GenerateUUID } from "../util/helper";
import Repeater from "../Repeater";

export default class CanvasNode extends Repeater {
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

    constructor({ canvas, ctx, draw, name, receive, isPublic, placeholder } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });

        this.supply = {
            Canvas: canvas,
            Context: ctx || canvas ? canvas.getContext("2d") : null,
            Images: {},
            Draw: draw,
        };

        this._config = {
            ...this._config,
            placeholder: placeholder,
            stream: null,
            video: document.createElement("video"),
        };
        this._config.video.setAttribute("autoplay", true);
        this._config.video.setAttribute("controls", true);

        this.state = {
            isActive: false
        };
        
        if(this.placeholder) {
            this.placeholder.replaceWith(this.video);
        }
    }

    get placeholder() {
        return this._config.placeholder;
    }

    get stream() {
        return this._config.stream;
    }
    set stream(stream) {
        this._config.stream = stream;
        this._config.video.srcObject = stream;
    }

    get video() {
        return this._config.video;
    }
    set video(element) {
        this._config.video = element;
    }

    copyTo(canvas) {
        let ctx = canvas.getContext("2d");
        ctx.drawImage(this.canvas, 0, 0);

        return canvas;
    }

    toggleSmoothLines() {
        this.ctx.lineCap = "round";

        return this;
    }

    relPos(absX, absY) {
        let { left, top } = this.canvas.getBoundingClientRect();

        return {
            x: absX - left,
            y: absY - top
        };
    }

    render(isActive) {
        if(isActive === true) {
            this.state.isActive = true;
        } else if(isActive === false) {
            this.state.isActive = false;
        }

        if(window.requestAnimationFrame) {
            if(this.state.isActive === true) {
                window.requestAnimationFrame((ts) => {
                    this.draw(ts);
                    
                    this.render();
                });
            }
        }
    }
    draw(...args) {
        if(typeof this.supply.Draw === "function") {
            this.supply.Draw(...args);
        }

        return this;
    }
    setDraw(draw) {
        this.supply.Draw = draw;

        return this;
    }

    setCanvas(canvas, ctx = "2d") {
        this.supply.Canvas = canvas;
        this.supply.Context = canvas.getContext(ctx);

        return this;
    }
    

    get canvas() {
        return this.supply.Canvas;
    }
    get ctx() {
        return this.supply.Context;
    }

    stopStreamTracks() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }

    //* <Streaming>
    getCanvasStream(fps = 10) {
        if(this.canvas) {
            this.stopStreamTracks();

            this.stream = this.canvas.captureStream(fps);

            return true;
        }

        return false;
    }

    drawVideoStream(ts) {
        this.ctx.drawImage(this.video, 0, 0);

        return this;
    }
    /**
     * ! WARNING: This utilizes (and therefore overwrites) `this.supply.Draw`
     */
    startVideoStreamRender() {
        this.setDraw(ts => this.drawVideoStream(ts));
        this.render(true);

        return this;
    }
    /**
     * ! WARNING: This utilizes (and therefore overwrites) `this.supply.Draw`
     */
    stopVideoStreamRender() {
        this.setDraw(null);
        this.render(false);

        return this;
    }
    //* </Streaming>


    loadImage(name, uri) {        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener("load", () => {
                this.supply.Images[ name ] = img;
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
        return this.supply.Canvas;
    }
    getCenterPoint() {
        return [
            this.supply.Canvas.width / 2,
            this.supply.Canvas.height / 2
        ];
    }

    resize(width, height) {
        this.supply.Canvas.width = width;
        this.supply.Canvas.height = height;

        return this;
    }

    //* Erasure methods
    clear() {
        this.ctx.clearRect(0, 0, this.supply.Canvas.width, this.supply.Canvas.height);

        return this;
    }
    erase(x, y, w, h) {
        this.ctx.clearRect(x, y, w, h);

        return this;
    }
    eraseNgon(n, x, y, r, { rotation = 0 } = {}) {
        let pColor = this.ctx.strokeStyle;
        let pBgColor = this.ctx.fillStyle;

        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillStyle = "#fff";
        this.ngon(n, x, y, r, { rotation, isFilled: true });

        // Reset the composite and revert color
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = pColor;
        this.ctx.fillStyle = pBgColor;
    }

    
    //* Context meta methods
    prop(...props) {
        if(Array.isArray(props[ 0 ])) {
            props.forEach(([ prop, value ]) => {
                this.ctx[ prop ] = value;
            });
        } else if(typeof props[ 0 ] === "object") {
            Object.entries(props[ 0 ]).forEach(([ prop, value ]) => {
                this.ctx[ prop ] = value;
            });
        }

        return this;
    }

    
    //* Shape methods
    circle(x, y, r, { isFilled = false } = {}) {
        if(isFilled) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, 2 * Math.PI);
            this.ctx.closePath();
            this.ctx.stroke();
        }

        return this;
    }

    point(x, y) {
        return this.rect(x, y, 1, 1);
    }

    line(x0, y0, x1, y1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.closePath();
        this.ctx.stroke();

        return this;
    }

    rect(x, y, w, h, { isFilled = false } = {}) {
        this.ctx.beginPath();
        if(isFilled) {
            this.ctx.fillRect(x, y, w, h);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.rect(x, y, w, h);
            this.ctx.closePath();
            this.ctx.stroke();
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

        this.ctx.beginPath();
        this.ctx.moveTo(...corners[ 0 ]);
        corners.forEach((c, i) => {
            if(i < corners.length - 1) {
                this.ctx.lineTo(...corners[i + 1]);
            }
        });
        this.ctx.lineTo(...corners[ 0 ]);
        this.ctx.closePath();

        if(isFilled) {
            // this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            this.ctx.stroke();
        }

        return this;
    }

    text(txt, x, y, { align = "center", color = "#000", font = "10pt mono" } = {}) {
        let xn = x,
            yn = y;

        if(align) {
            this.ctx.textAlign = align;
            this.ctx.textBaseline = "middle";
        }

        let pColor = this.ctx.fillStyle;
        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.fillText(txt, xn, yn);
        this.ctx.fillStyle = pColor;

        return this;
    }

    image(name, ...args) {
        this.ctx.drawImage(this.supply.Images[ name ], ...args);

        return this;
    }

    tile(name, size, sx, sy, dx, dy) {
        this.ctx.drawImage(this.supply.Images[ name ], sx, sy, size, size, dx, dy, size, size);

        return this;
    }
}