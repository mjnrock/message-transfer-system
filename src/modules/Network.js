import ConnectionBroker from "./../network/ConnectionBroker";

export function Load(node, { isMaster = false, routes = [] } = {}) {
    node.Network = new ConnectionBroker(node._parent, { isMaster });
    
    node._parent.register(node.Network);

    if(routes.length) {
        node._parent.Router.addRoute(node.Network, routes);
    }

    return node;
}

export default Load;