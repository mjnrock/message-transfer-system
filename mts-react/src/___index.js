import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import MediaStreamNode from "./lib/client/MediaStreamNode";
import CanvasNode from "./lib/client/CanvasNode";

const LOG = input => document.getElementById("debug").innerHTML = JSON.stringify(input, null, 2);
const LOG2 = input => document.getElementById("gubed").innerHTML = JSON.stringify(input, null, 2);

let MSN = new MediaStreamNode({ placeholder: document.getElementById("main-video") });
// let MSN = new MediaStreamNode();
// let CN = new CanvasNode({ canvas: document.getElementById("canvas") });
let CN = new CanvasNode({ canvas: document.getElementById("canvas"), placeholder: document.getElementById("other-video") });

// MSN.getMediaDevices();
// MSN.getUserMedia({ cn: CN });
document.getElementById("user-action").onclick = e => MSN.getUserMedia({ cn: CN });
document.getElementById("user-action-2").onclick = e => MSN.getDisplayMedia({ cn: CN });

// setInterval(() => {
//     CN.line(
//         ~~(Math.random() * 500),
//         ~~(Math.random() * 500),
//         ~~(Math.random() * 500),
//         ~~(Math.random() * 500),
//     );
// }, 250);


// MSN.getDisplayMedia();
// let video = document.getElementById("main-video");
// // console.log(video)
// video.replaceWith(MSN.video);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);