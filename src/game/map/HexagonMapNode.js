import Node from "./../../Node";
import { GenerateUUID } from "./../../helper";

export default class HexagonMapNode extends Node {
    constructor(width, height, { name = null, receive = null, mnode = null, packager = null } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            mnode: mnode,
            packager: packager
        });

        this.internal = {
            Width: width,
            Height: height
        };
    }
};