import KeyboardNode from "./KeyboardNode";
import MouseNode from "./MouseNode";
import TouchNode from "./TouchNode";

function attachNamespace(node, leaf = {}) {
    node.Browser = node.Browser || {};
    node.Browser.Input = node.Browser.Input || {};

    for(let name in leaf) {
        node.Browser.Input[ name ] = leaf[ name ];

        node._parent.register(leaf[ name ]);
    }

    return node;
}

export function Load(node, {
    Mouse = false,
    MouseComplex = false,
    Touch = false,
    Keys = false,
} = {}) {
    if(!window) {
        throw new Error("Window is not supported");
    }

    if(Mouse || MouseComplex) {
        let mouse = new MouseNode();

        if(MouseComplex === true) {
            mouse.toggleComplexActions();
        }
        
        attachNamespace(node, {
            Mouse: mouse
        });
    }

    if(Touch) {
        let touch = new TouchNode();
        
        attachNamespace(node, {
            Touch: touch
        });
    }

    if(Keys) {
        let keys = new KeyboardNode();
        
        attachNamespace(node, {
            Keys: keys
        });
    }

    return node;
}

export default Load;