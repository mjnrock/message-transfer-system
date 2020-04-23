import Node from "../Node";
import CanvasNode from "./CanvasNode";

export default class MediaStreamNode extends Node {
    static TrackType = {
        AUDIO: "audio",
        VIDEO: "video",
        SCREEN: "screen",
        CANVAS: "canvas",
    };

    static Resolution = {
        P240: [ 426, 240 ],
        P360: [ 640, 360 ],
        P480: [ 854, 480 ],
        P720: [ 1280, 720 ],
        P1080: [ 1920, 1080 ],
        P2160: [ 3840, 2160 ],
        P4320: [ 7680, 4320 ],

        HD: [ 1280, 720 ],
        FHD: [ 1920, 1080 ],
        K4: [ 3840, 2160 ],
        K8: [ 7680, 4320 ],
    };

    static SampleRate = {
        PHONE: 8000,
        CD_LOW: 11025,
        CD_HALF: 22050,
        MINIDV: 32000,
        CD: 44100,
        CD_HIGH: 88200,
        DVD: 96000,
        HDCD: 176400,
        BDROM: 192000,
    }

    constructor({ name, receive, isPublic, stream, video } = {}) {
        super({ name, receive, isPublic });

        this._config = {
            ...this._config,
            devices: {},
            stream: stream,
            video: video || document.createElement("video")
        };

        this.video.setAttribute("autoplay", true);
    }

    get stream() {
        return this._config.stream;
    }
    set stream(value) {
        this._config.stream = value;
        this.video.srcObject = value;
    }

    get video() {
        return this._config.video;
    }
    set video(value) {
        this.video = value;
    }
}