import Node from "../Node";
import CanvasNode from "./CanvasNode";

export default class MediaStreamNode extends Node {
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

    constructor({ name, receive, isPublic, video, stream, placeholder } = {}) {
        super({ name, receive, isPublic });

        this._config = {
            ...this._config,
            stream: stream,
            video: video || document.createElement("video"),
            devices: {
                audio: {},
                video: {},
                speaker: {}
            },
            placeholder: placeholder
        };
        
        if(!video) {
            this.video.setAttribute("autoplay", true);
            this.video.setAttribute("controls", true);
            this.size(720, 480);
        }
            
        if(this.placeholder) {
            this.placeholder.replaceWith(this.video);
        }
    }

    get streamId() {
        return this.stream.id;
    }
    get streamIsActive() {
        return this.stream.active;
    }
    get streamHasEnded() {
        return this.stream.ended;
    }

    /**
     * This is meant to be a DOMElement to replace
     */
    get placeholder() {
        return this._config.placeholder;
    }

    getMediaDevices() {
        navigator.mediaDevices.enumerateDevices()
            .then(this._registerDevices.bind(this))
            .catch(e => console.log(e));
    }

    _registerDevices(devices) {
        for(let device of devices) {
            if (device.kind === "videoinput") {
                this._config.devices.video[ device.deviceId ] = {
                    id: device.deviceId,
                    label: device.label || `Video ${ Object.keys(this._config.devices.video).length + 1}`,
                    device
                };
            } else if (device.kind === "audioinput") {
                this._config.devices.audio[ device.deviceId ] = {
                    id: device.deviceId,
                    label: device.label || `Microphone ${ Object.keys(this._config.devices.audio).length + 1}`,
                    device
                };
            } else if (device.kind === "audiooutput") {
                this._config.devices.speaker[ device.deviceId ] = {
                    id: device.deviceId,
                    label: device.label || `Speaker ${ Object.keys(this._config.devices.speaker).length + 1}`,
                    device
                };
            } 
        }
    }
    
    static async GetMediaDevices() {
        let config = {
            devices: {
                audio: {},
                video: {},
                speaker: {},
            }
        };

        return await navigator.mediaDevices.enumerateDevices()
            .then(devices => {                
                for(let device of devices) {
                    if (device.kind === "videoinput") {
                        config.devices.video[ device.deviceId ] = {
                            id: device.deviceId,
                            label: device.label || `Video ${ Object.keys(config.devices.video).length + 1}`,
                            device
                        };
                    } else if (device.kind === "audioinput") {
                        config.devices.audio[ device.deviceId ] = {
                            id: device.deviceId,
                            label: device.label || `Microphone ${ Object.keys(config.devices.audio).length + 1}`,
                            device
                        };
                    } else if (device.kind === "audiooutput") {
                        config.devices.speaker[ device.deviceId ] = {
                            id: device.deviceId,
                            label: device.label || `Speaker ${ Object.keys(config.devices.speaker).length + 1}`,
                            device
                        };
                    } 
                }

                return config;
            })
            .catch(e => console.log(e));
    }

    useDevice(type = "video", deviceIdOrIndex, constraints) {
        if(type === "audio" || type === "video" || type === "speaker") {
            let deviceId;

            if(typeof deviceIdOrIndex === "number") {
                deviceId = Object.values(this._config.devices[ type ])[ deviceIdOrIndex ];
            } else {
                deviceId = this._config.devices[ type ][ deviceIdOrIndex ];
            }

            if(deviceId) {
                if(type === "speaker") {
                    this.video.setSinkId(deviceId);
                } else {
                    let cons = {
                        ...constraints
                    };
                    cons[ type ].deviceId = deviceId;
    
                    this.getUserMedia(cons);
                }

                return true;
            }
        }

        return false;
    }
    useVideoDevice(deviceIdOrIndex, constraints = { audio: true }) {
        return this.useDevice("video", deviceIdOrIndex, constraints);
    }
    useAudioDevice(deviceIdOrIndex, constraints = { video: true }) {
        return this.useDevice("audio", deviceIdOrIndex, constraints);
    }
    useSpeakerDevice(deviceIdOrIndex) {
        return this.useDevice("speaker", deviceIdOrIndex);
    }
    
    getUserMedia({ callback, cn, constraints = { audio: true, video: { width: { min: 426, ideal: 1920 }, height: { min: 240, ideal: 1080 }} } } = {}) {
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            this.stop();
            this.getMediaDevices();
            
            this.stream = stream;

            return stream;
        })
        .then(stream => {
            if(cn instanceof CanvasNode) {
                cn.stream = stream;
                cn.startVideoStreamRender();
            }

            if(typeof callback === "function") {
                callback(stream, cn);
            }
        })
            .catch(e => console.log(e));

        return this;
    }
    getDisplayMedia({ callback, cn, constraints = { video: { width: { ideal: 1920 }, height: { ideal: 1080 }} } } = {}) {
        navigator.mediaDevices.getDisplayMedia(constraints)
            .then(stream => {
                this.stop();

                this.stream = stream;

                return stream;
            })
            .then(stream => {
                if(cn instanceof CanvasNode) {
                    cn.stream = stream;
                    cn.startVideoStreamRender();
                }

                if(typeof callback === "function") {
                    callback(stream, cn);
                }
            })
            .catch(e => console.log(e));

        return this;
    }
    getCanvasMedia(canvas, fps = 10) {
        this.stop();

        if(canvas instanceof CanvasNode) {
            this.stream = canvas.canvas.captureStream(fps);
        } else {
            this.stream = canvas.captureStream(fps);
        }

        return this;
    }

    get stream() {
        return this._config.stream;
    }
    set stream(stream) {
        this._config.stream = stream;
        this._config.video.srcObject = stream;
    }

    /**
     * This stops the tracks completely and sets `stream.ended = true`
     */
    stop() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
    /**
     * This "mutes" the stream by disabling it.  It is still active, but no data will transmit.
     */
    pause() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.enabled = false);
        }
    }
    /**
     * This "unmutes" the stream by enabling it.
     */
    play() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.enabled = true);
        }
    }
    clear() {
        this.stream = null;
    }

    
    getTracks(type = "video", ...indexes) {
        if(this.stream) {
            let tracks;
            
            if(type === "audio") {
                tracks = this.stream.getAudioTracks();
            } else if(type === "video") {
                tracks = this.stream.getVideoTracks();
            } else {
                return false;
            }

            if(indexes.length === 1) {
                return tracks[ indexes[ 0 ] ];
            } else if(indexes.length) {
                return tracks.filter((t, i) => indexes.includes(++i));
            }

            return tracks;
        }

        return false;
    }    
    getAudioTracks(...indexes) {
        return this.getTracks("audio", ...indexes);
    }
    getVideoTracks(...indexes) {
        return this.getTracks("video", ...indexes);
    }

    get video() {
        return this._config.video;
    }
    set video(element) {
        this._config.video = element;
    }

    size(width = 720, height = 480) {
        this.video.style.width = width;
        this.video.style.height = height;
    }    

    toCanvas(canvas) {
        if(this.stream) {
            canvas.getContext("2d").drawImage(this.video, 0, 0);

            return true;
        }

        return false;
    }
}