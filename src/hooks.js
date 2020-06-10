/* eslint-disable */
import { useContext, useState, useEffect } from "react";
import { Context } from "./../App";
import Node from "./Node";

//* Only real requirement is that the Context.Provider contains a kvp of { node: <Node> }
export function useNodeContext(context) {
    const { node: ctxNode } = useContext(context || Context);
    const [ state, setState ] = useState({
        node: ctxNode,
        state: ctxNode.state
    });

    useEffect(() => {
        const componentNode = new Node();

        componentNode.watchMessages(ctxNode);
        componentNode.after = (msg) => {
            setState({
                node: ctxNode,
                state: ctxNode.state
            });
        }

        return () => componentNode.unwatchMessages(ctxNode);
    }, []);

    return state;
};