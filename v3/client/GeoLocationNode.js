import { GenerateUUID } from "./../util/helper";
import Node from "./../Node";

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

    constructor({ name, receive, isPublic = false } = {}) {
        super({
            name: name || GenerateUUID(),
            receive: receive,
            isPublic: isPublic,
        });
        
        if(!navigator.geolocation) {
            throw new Error("Geolocation is not supported");
        }
    }

    getPosition({ enableHighAccuracy = true, timeout = 5000, maximumAge = 0 } = {}) {
        navigator.geolocation.getCurrentPosition(position => {
            this.emit(
                GeoLocationNode.SignalTypes.POSITION,
                position.coords
            );
        }, e => {
            this.emit(
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
            this.emit(
                GeoLocationNode.SignalTypes.POSITION,
                position.coords
            );
        }, e => {
            this.emit(
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