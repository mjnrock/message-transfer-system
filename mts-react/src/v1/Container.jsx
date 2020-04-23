import React from "react";

export default class Container extends React.Component {
    render() {
        return (
            <div className={ `${ this.props.className || "pa2 ma1" }` }>
                { this.props.children }
            </div>
        );
    }
};