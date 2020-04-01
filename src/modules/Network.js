import ConnectionBroker from "./../network/ConnectionBroker";

export function Load(node, { isMaster = false, routes = [] } = {}) {
    node.Network = new ConnectionBroker(node._mnode, { isMaster });
    
    node._mnode.register(node.Network);

    if(routes.length) {
        node._mnode.Router.addRoute(node.Network, routes);
    }

    return node;
}

export default Load;