import Node from "./../Node";
import { GenerateUUID } from "./../helper";

export default class GeoLocationNode extends Node {
    static SignalTypes = {
        POSITION: "GeoLocationNode.Position",
        ERROR: "GeoLocationNode.Error",
    };
    
    static AllSignalTypes(...filter) {
        return Object.values(GeoLocationNode.SignalTypes).filter(st => {
            if(filter.includes(st)) {
                return false;
            }

            return true;
        });
    }

    constructor({ name = null, receive = null, parent = null, packager = null } = {}) {
        super(name || GenerateUUID(), {
            receive: receive,
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