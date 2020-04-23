import React from "react";
import MediaStreamNode from "./lib/client/MediaStreamNode";

const context = React.createContext({
    media: new MediaStreamNode(),
    display: new MediaStreamNode(),
});

export default context;