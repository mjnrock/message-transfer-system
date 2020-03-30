import Node from "./../../Node";
import { GenerateUUID } from "../../helper";

export default class HexagonMapNode extends Node {
    constructor(width, height, { name = null, receive = null, parent = null, packager = null } = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
            parent: parent,
            packager: packager
        });

        this.internal = {
            Width: width,
            Height: height
        };
    }
};