import WebSocket from "ws";
global.WebSocket = WebSocket;

import Message from "./Message";
import Node from "./Node";
import Repeater from "./Repeater";
import Registry from "./Registry";
import Router from "./Router";

import Main from "./Main";

import Browser from "./browser/package";
import Network from "./network/package";

export default {
    Message,
    Node,
    Repeater,
    Registry,
    Router,

    Main,
    
    Browser,
    Network
};