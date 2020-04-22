import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MTSLib from "./lib/index";

const LOG = input => document.getElementById("debug").innerHTML = JSON.stringify(input, null, 2);
const LOG2 = input => document.getElementById("gubed").innerHTML = JSON.stringify(input, null, 2);

// const MTS = MTSLib.Modules.BrowserInput(new MTSLib.MasterNode({
//         receive: LOG,
//         routes: [
//             ...MTSLib.Browser.Input.KeyboardNode.AllSignalTypes(),
//             ...MTSLib.Browser.Input.MouseNode.AllSignalTypes(
//                 MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MOVE,
//                 MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_MASK,
//             ),
//             // MTSLib.Browser.Input.MouseNode.SignalTypes.MOUSE_SELECTION,
//             ...MTSLib.Browser.Input.TouchNode.AllSignalTypes(),
//         ]
//     }), {
//         Keys: true,
//         // Mouse: true,
//         MouseComplex: true,
//         Touch: true
//     });
const MTS = MTSLib.Modules.Network(new MTSLib.MasterNode({
    receive: LOG
}));

// // MTSLib.Modules.Network(MTS);
// setTimeout(() => {
// MTS.Network.webSocketNode({ uri: `192.168.86.100:3000` });
// }, 500);

console.log(MTS);

let canvas = document.getElementById("canvas");
let pos = {
    x: ~~(canvas.width / 2),
    y: ~~(canvas.height / 2)
};
let ctx = canvas.getContext("2d");

let s = 5;
ctx.fillStyle = "rgb(0, 0, 0)";

window.onresize = e => {
    ResizeCanvas();
};
function ResizeCanvas() {
    canvas.width = 10;//window.innerWidth;
    canvas.height = 10;//window.innerHeight;
}
ResizeCanvas();

let eventData = {};

setInterval(() => {
    MTS.send("GyroData", eventData, { elevate: true });
}, 1000);



if (typeof DeviceMotionEvent.requestPermission === 'function') {
    LOG("MOTION: ITS A THING")
}


let button = document.getElementById("user-action");
button.onclick = () => {
    DeviceOrientationEvent.requestPermission()
    .then(response => {
        // if (window.DeviceOrientationEvent) {
            window.addEventListener("deviceorientation", function (event) {
                // LOG2(event);
                LOG([event.alpha, event.beta, event.gamma, event.absolute]);
        
                // "Bubble" style
                // let x = -event.gamma,
                //     y = -event.beta;
        
                // "True" conversion
                    //portrait
                let x = event.gamma,
                    y = event.beta;
                    //Landscape
                // let x = event.beta,
                //     y = event.gamma;
        
                if (x > 90) { x = 90 };
                if (x < -90) { x = -90 };
        
                x += 90;
                y += 90;
        
                pos.x = (canvas.width * x / 180);
                pos.y = (canvas.height * y / 180);
        
                draw();
            }, false);
            LOG("Device Orientation is supported, but has been blocked");
        // } else {
        //     LOG("Device Orientation is not supported");
        // }
    })
    .catch(e => LOG("Device Orientation is not supported"))

    DeviceMotionEvent.requestPermission()
    .then(response => {
        // if (window.DeviceMotionEvent) {
            window.addEventListener("devicemotion", function (event) {
                // LOG2(event.acceleration);
                // LOG2([event.acceleration, event.accelerationIncludingGravity, event.rotationRate, event.interval]);

                let data = {
                    ax: event.acceleration.x.toFixed(1),
                    ay: event.acceleration.y.toFixed(1),
                    az: event.acceleration.z.toFixed(1),

                    gx: event.accelerationIncludingGravity.x.toFixed(1),
                    gy: event.accelerationIncludingGravity.y.toFixed(1),
                    gz: event.accelerationIncludingGravity.z.toFixed(1),

                    a: event.rotationRate.alpha.toFixed(1),
                    b: event.rotationRate.beta.toFixed(1),
                    g: event.rotationRate.gamma.toFixed(1),

                    int: event.interval
                };

                LOG2(data);

                eventData = data;
            }, false);
        //     LOG("Device Motion is supported, but has been blocked");
        // } else {
        //     LOG("Device Motion is not supported");
        // }
    })
    .catch(e => LOG("Device Motion is not supported"))
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(pos.x - 25, pos.y - 25, s * 2, s * 2);
}
// else {
//     window.addEventListener("MozOrientation", function (event) {
//         // LOG2(orientation);
//         LOG([event.alpha, event.beta, event.gamma, event.absolute]);
//         // LOG([orientation.x * 50, orientation.y * 50]);
//     }, true);
// }

ReactDOM.render(
    <App />,
    document.getElementById("root")
);