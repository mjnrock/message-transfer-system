import Node from "./node/package";

//* Use this file as a "file variable"
const StateNode = new Node.Node({
    cats: 2
});
StateNode.addReducer("cats", (state, msg) => {
    return {
        ...state,
        cats: msg.payload
    };
})

export default StateNode;