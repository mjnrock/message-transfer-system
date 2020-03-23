import Node from "./../Node";
import { GenerateUUID } from "./../helper";

export default class GeoLocationNode extends Node {
    static SignalTypes = {
        POSITION: "GeoLocationNode.Position",
        ERROR: "GeoLocationNode.Error",
    };
    //* The primary use of this function is for <Router>
    static AllSignalTypes() {
        return Object.values(GeoLocationNode.SignalTypes);
    }

    constructor({ parent = null, packager = null } = {}) {
        super(GenerateUUID(), {
            parent: parent,
            packager: packager
        });

        this.state = {
            Watcher: null
        };
        
        if(!navigator.geolocation) {
            throw new Error("Geolocation is not supported");
        }
    }

    getPosition({ enableHighAccuracy = true, timeout = 5000, maximumAge = 0 } = {}) {
        navigator.geolocation.getCurrentPosition(position => {
            this.send(
                GeoLocationNode.SignalTypes.POSITION,
                position.coords
            );
        }, e => {
            this.send(
                GeoLocationNode.SignalTypes.ERROR,
                e.message || "Unspecified error"
            );
        }, {
            enableHighAccuracy,
            timeout,
            maximumAge
        });
    }

    watchPosition({ enableHighAccuracy = true, timeout = 5000, maximumAge = 0 } = {}) {
        navigator.geolocation.watchPosition(position => {
            this.send(
                GeoLocationNode.SignalTypes.POSITION,
                position.coords
            );
        }, e => {
            this.send(
                GeoLocationNode.SignalTypes.ERROR,
                e.message || "Unspecified error"
            );
        }, {
            enableHighAccuracy,
            timeout,
            maximumAge
        });
    }
};