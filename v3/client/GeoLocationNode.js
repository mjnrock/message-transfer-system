import { GenerateUUID } from "./../util/helper";
import Node from "./../Node";

export default class GeoLocationNode extends Node {
    static MessageTypes = {
        POSITION: "GeoLocationNode.Position",
        ERROR: "GeoLocationNode.Error",
    };
    
    static AllMessageTypes(...filter) {
        return Object.values(GeoLocationNode.MessageTypes).filter(st => {
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
                GeoLocationNode.MessageTypes.POSITION,
                position.coords
            );
        }, e => {
            this.emit(
                GeoLocationNode.MessageTypes.ERROR,
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
                GeoLocationNode.MessageTypes.POSITION,
                position.coords
            );
        }, e => {
            this.emit(
                GeoLocationNode.MessageTypes.ERROR,
                e.message || "Unspecified error"
            );
        }, {
            enableHighAccuracy,
            timeout,
            maximumAge
        });
    }
};