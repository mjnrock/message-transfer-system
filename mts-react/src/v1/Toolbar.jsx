import React from "react";

export default class Toolbar extends React.Component {
    render() {
        return (
            <div className={ `bg-moon-gray ${ this.props.className }` }>
                { this.props.children }
            </div>
        );
    }
};