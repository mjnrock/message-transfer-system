import React from "react";
import ReactDOM from "react-dom";
import App from "../App";

import KeyboardNode from "./lib/dom/KeyboardNode";
import MouseNode from "./lib/dom/MouseNode";
import TouchNode from "./lib/dom/TouchNode";

const LOG = input => document.getElementById("debug").innerHTML = JSON.stringify(input, null, 2);
const LOG2 = input => document.getElementById("gubed").innerHTML = JSON.stringify(input, null, 2);

let kbn = new KeyboardNode();
let mn = new MouseNode();
let tn = new TouchNode();

kbn.addListener(msg => console.log(msg));
mn.addListener(msg => console.log(msg));
tn.addListener(msg => console.log(msg));

ReactDOM.render(
    <App />,
    document.getElementById("root")
);