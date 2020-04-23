import React from "react";

import Ribbon from "./menu/Ribbon";
import StreamView from "./StreamView";

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            page: null
        };
    }

    render() {
        return (
            <div>
                <Ribbon />

                <StreamView width={ 640 } height={ 480 } />
            </div>
        );
    }
};
//     render() {
//         return (            
//             <div className="p-0" style={{ height: "100vh" }}>
//                 <div data-role="navview" data-compact="md" data-expand="lg" data-toggle="#pane-toggle" data-active-state="true">
//                     <nav className="navview-pane">
//                         <button className="pull-button">
//                             <span className="mif-menu"></span>
//                         </button>

//                         <ul className="navview-menu">
//                             <li>
//                                 <a href="#">
//                                     <span className="icon"><span className="mif-home"></span></span>
//                                     <span className="caption">Main</span>
//                                 </a>
//                             </li>
                            
//                             <li className="item-separator"></li>

//                             <li className="item-header">Streams</li>
                            
//                             <li>
//                                 <a href="#">
//                                     <span className="icon"><span className="mif-video-camera"></span></span>
//                                     <span className="caption">Video</span>
//                                 </a>
//                             </li>
//                             <li className="active">
//                                 <a href="#">
//                                     <span className="icon"><span className="mif-mic"></span></span>
//                                     <span className="caption">Audio</span>
//                                 </a>
//                             </li>
//                             <li>
//                                 <a href="#">
//                                     <span className="icon"><span className="mif-display"></span></span>
//                                     <span className="caption">Display</span>
//                                 </a>
//                             </li>
//                             <li>
//                                 <a href="#">
//                                     <span className="icon"><span className="mif-pencil"></span></span>
//                                     <span className="caption">Canvas</span>
//                                 </a>
//                             </li>
//                         </ul>
//                     </nav>

//                     <div className="navview-content">
//                         <Ribbon />
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// };