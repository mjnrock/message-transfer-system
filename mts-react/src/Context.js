import React from "react";
import MediaStreamNode from "./lib/client/MediaStreamNode";

const context = React.createContext(new MediaStreamNode);

export default context;