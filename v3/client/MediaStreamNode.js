import Node from "../Node";
import CanvasNode from "./CanvasNode";

//! MediaRecorder API example
// var canvas = document.querySelector("canvas");

// // Optional frames per second argument.
// var stream = canvas.captureStream(25);
// var recordedChunks = [];

// console.log(stream);
// var options = { mimeType: "video/webm; codecs=vp9" };
// mediaRecorder = new MediaRecorder(stream, options);

// mediaRecorder.ondataavailable = handleDataAvailable;
// mediaRecorder.start();

// function handleDataAvailable(event) {
//   console.log("data-available");
//   if (event.data.size > 0) {
//     recordedChunks.push(event.data);
//     console.log(recordedChunks);
//     download();
//   } else {
//     // ...
//   }
// }
// function download() {
//   var blob = new Blob(recordedChunks, {
//     type: "video/webm"
//   });
//   var url = URL.createObjectURL(blob);
//   var a = document.createElement("a");
//   document.body.appendChild(a);
//   a.style = "display: none";
//   a.href = url;
//   a.download = "test.webm";
//   a.click();
//   window.URL.revokeObjectURL(url);
// }

// // demo: to download after 9sec
// setTimeout(event => {
//   console.log("stopping");
//   mediaRecorder.stop();
// }, 9000);

export default class MediaStreamNode extends Node {
    static TrackType = {
        AUDIO: "audio",
        VIDEO: "video",
        USER: "user",
        DISPLAY: "display",
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
            video: video || document.createElement("video"),
            type: null
        };

        this.video.setAttribute("autoplay", true);

        this.getMediaDevices();
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

    get type() {
        return this._config.type;
    }

    getUserMedia({ callback, constraints, partial } = {}) {
        let cons = constraints || this.getDefaultConstraints();

        if(partial) {
            for(let key in partial) {
                cons[ key ] = partial[ key ];
            }
        }

        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        navigator.mediaDevices.getUserMedia(cons)
            .then(stream => {
                this.stream = stream;

                for(let track of this.stream.getAudioTracks()) {
                    track.applyConstraints(cons.audio);
                }
                for(let track of this.stream.getVideoTracks()) {
                    track.applyConstraints(cons.video);
                }

                this.getMediaDevices();

                return stream;
            })
            .then(stream => {
                if(cons.video) {
                    this._config.type = MediaStreamNode.TrackType.USER;
                } else if(cons.audio) {
                    this._config.type = MediaStreamNode.TrackType.AUDIO;
                }

                if(typeof callback === "function") {
                    callback(stream);
                }

                return stream;
            })
            .catch(e => console.log(e));
    }
    getDisplayMedia({ callback, constraints, partial } = {}) {
        let { video } = this.getDefaultConstraints(),
            cons = constraints || video;

        if(partial) {
            for(let key in partial) {
                cons[ key ] = partial[ key ];
            }
        }

        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        navigator.mediaDevices.getDisplayMedia(cons)
            .then(stream => {
                this.stream = stream;

                for(let track of this.stream.getVideoTracks()) {
                    track.applyConstraints(cons.video);
                }

                return stream;
            })
            .then(stream => {                        
                this._config.type = MediaStreamNode.TrackType.DISPLAY;

                if(typeof callback === "function") {
                    callback(stream);
                }

                return stream;
            })
            // .then(stream => {
            //     navigator.mediaDevices.getUserMedia({ audio, video: false })
            //         .then(vox => {
            //             this.stream = stream;

            //             if(vox.getAudioTracks().length) {        
            //                 let track = vox.getAudioTracks()[ 0 ];
            //                 track.applyConstraints(cons.audio);
            //                 this.stream.addTrack(track);
            //             }
                        
            //             if(typeof callback === "function") {
            //                 callback(stream);
            //             }

            //             return stream;
            //         })

            //     return stream;
            // })
            .catch(e => console.log(e));
    }
    getCanvasMedia({ fps = 10, canvas, cn, callback } = {}) {
        let stream = null;

        if(canvas && canvas.captureStream) {
            stream = canvas.captureStream(fps);
        } else if(cn instanceof CanvasNode) {
            stream = cn.getStream(fps)
        }

        if(stream) {
            this.stream = stream;

            this._config.type = MediaStreamNode.TrackType.CANVAS;

            if(typeof callback === "function") {
                callback(stream);
            }
        }
    }

    getTrack(search, type = MediaStreamNode.TrackType.AUDIO) {
        if(!this.stream) {
            return false;
        }

        let track,
            fn;

        if(type === "audio") {
            fn = "getAudioTracks";
        } else if(type === "video") {
            fn = "getVideoTracks";
        } else {
            fn = "getTracks";
        }

        if(typeof search === "number") {
            // Index
            track = (this.stream[ fn ]() || [])[ search ];
        } else if(typeof search === "string" || search instanceof String) {
            // Track Id
            track = this.stream.getTrackById(search);
        } else if(typeof search === "object" && "kind" in search && search.kind === `${ type }input`) {
            // Track
            track = search;
        }

        return track;
    }
    addTrack(search, type = MediaStreamNode.TrackType.AUDIO) {
        let track = this.getTrack(type, search);

        if(track && this.stream) {
            this.stream.addTrack(track);

            return true;
        }

        return false;
    }

    getAudioTrack(search) {
        return this.getTrack(search, MediaStreamNode.TrackType.AUDIO);
    }
    addAudioTrack(input) {
        return this.addTrack(input, MediaStreamNode.TrackType.AUDIO);
    }

    getVideoTrack(search) {
        return this.getTrack(search, MediaStreamNode.TrackType.VIDEO);
    }
    addVideoTrack(input) {
        return this.addTrack(input, MediaStreamNode.TrackType.VIDEO);
    }

    
    async getMediaDevices() {
        return await navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const counts = {
                    audioinput: 1,
                    videoinput: 1
                };

                const packer = device => ({
                    id: device.deviceId,
                    type: device.kind,
                    label: device.label || `${ device.kind === "audioinput" ? "Mic" : "Video" } ${ counts[ device.kind ].length + 1}`,
                    device
                });

                for(let device of devices) {
                    this._config.devices[ device.deviceId ] = packer(device);
                    counts[ device.kind ] += 1;
                }
            })
            .catch(e => console.log(e));
    }

    get devices() {
        let devices = {
            audioinput: [],
            videoinput: []
        };

        for(let device of Object.values(this._config.devices)) {
            if(device.type in devices) {
                devices[ device.type ].push(device);
            }
        }

        return devices;
    }

    getDevice(search, type = MediaStreamNode.TrackType.AUDIO) {
        let device;

        if(typeof search === "number") {
            // Index
            device = Object.values(this._config.devices)[ search ];
        } else if(typeof search === "string" || search instanceof String) {
            // Device Id
            device = this._config.devices[ search ];
        } else if(typeof search === "object" && "kind" in search && search.kind === `${ type }input`) {
            // Audio Track
            device = search;
        }

        return device;
    }
    getAudioDevice(search) {
        return this.getDevice(search, MediaStreamNode.TrackType.AUDIO);
    }
    getVideoDevice(search) {
        return this.getDevice(search, MediaStreamNode.TrackType.AUDIO);
    }

    getCurrentDevices() {
        if(this.stream) {
            let devices = {
                    audio: [],
                    video: []
                };

            for(let track of this.stream.getTracks()) {
                let settings = track.getSettings();

                if(track.kind === "audio") {
                    devices.audio.push(settings.deviceId);
                } else if(track.kind === "video") {
                    devices.video.push(settings.deviceId);
                }
            }

            return devices;
        }

        return false;
    }

    useDevice(device, { callback, constraints } = {}) {
        this.changeConstraints({ 
            callback,
            hook: cons => {
                if(device.type === "audioinput") {
                    cons.audio = cons.audio || {};
                    cons.audio.deviceId = { exact: device.id };
                } else if(device.type === "videoinput") {
                    cons.video = cons.video || {};
                    cons.video.deviceId = { exact: device.id };
                }
                
            },
            constraints
        });
    }

    /**
     * @param {string} constrain "exact" | "ideal"
     */
    changeResolution({ res = MediaStreamNode.Resolution.P1080, width, height, callback, constrain = "ideal" } = {}) {
        let [ w, h ] = res;

        if(width) {
            w = ~~width;
        }
        if(height) {
            h = ~~height;
        }

        this.changeConstraints({ 
            callback,
            hook: cons => {
                cons.video = cons.video || {};
                cons.video.width = { [ constrain ]: w };
                cons.video.height = { [ constrain ]: h };
            }
        });
    }

    changeConstraints({ constraints, hook, callback } = {}) {
        if(this.stream) {
            let audio = this.getAudioTrack(0),
                video = this.getVideoTrack(0),
                cons = constraints || {};
    
            if(audio && !cons.audio) {
                cons.audio = audio.getConstraints() || this.getDefaultConstraints({ audio: true, video: false });
            }
            if(video && !cons.video) {
                cons.video = video.getConstraints() || this.getDefaultConstraints({ audio: false, video: true });
            }

            if(typeof hook === "function") {
                hook(cons);
            }

            if(this._config.type === MediaStreamNode.TrackType.USER) {                
                this.getUserMedia({
                    callback,
                    constraints: cons
                });
            } else if(this._config.type === MediaStreamNode.TrackType.AUDIO) {                
                this.getUserMedia({
                    callback,
                    constraints: cons
                });
            } else if(this._config.type === MediaStreamNode.TrackType.DISPLAY) {
                this.getDisplayMedia({
                    callback,
                    constraints: cons
                });
            }
        }
    }

    get controller() {
        const _this = this;

        return {
            isAudioPaused() {
                let track = _this.getAudioTrack(0);

                if(track) {
                    return !track.enabled;
                }

                return false;
            },
            isVideoPaused() {
                let track = _this.getVideoTrack(0);

                if(track) {
                    return !track.enabled;
                }

                return false;
            },
            /**
             * This stops the tracks completely and sets `stream.ended = true`
             */
            stop() {
                if(_this.stream) {
                    _this.stream.getTracks().forEach(track => track.stop());
                }
            },
            /**
             * This "mutes" the stream by disabling it.  It is still active, but no data will transmit.
             */
            pause(type) {
                if(_this.stream) {
                    if(type === "audio") {
                        _this.stream.getAudioTracks().forEach(track => track.enabled = false);
                    } else if(type === "video") {
                        _this.stream.getVideoTracks().forEach(track => track.enabled = false);
                    } else {
                        _this.stream.getTracks().forEach(track => track.enabled = false);
                    }
                }
            },
            /**
             * This "unmutes" the stream by enabling it.
             */
            play(type) {
                if(_this.stream) {
                    if(type === "audio") {
                        _this.stream.getAudioTracks().forEach(track => track.enabled = true);
                    } else if(type === "video") {
                        _this.stream.getVideoTracks().forEach(track => track.enabled = true);
                    } else {
                        _this.stream.getTracks().forEach(track => track.enabled = true);
                    }
                }
            },
            toggle(type) {
                if(_this.stream) {
                    if(type === "audio") {
                        _this.stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                    } else if(type === "video") {
                        _this.stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
                    } else {
                        _this.stream.getTracks().forEach(track => track.enabled = !track.enabled);
                    }
                }
            },
            clear() {
                _this.stream = null;
            }
        };
    }

    
    getDefaultConstraints({ audio = true, video = true } = {}) {
        if(audio === true && video === true) {
            return {
                audio: {
                    channelCount: 2,
                    sampleRate: 44100
                },
                video: {
                    width: {
                        ideal: 1920
                    },
                    height: {
                        ideal: 1080
                    }
                }
            };
        } else if(audio === true) {
            return {
                audio: {
                    channelCount: 2,
                    sampleRate: 44100
                },
                video: false
            };
        } else if(video === true) {
            return {
                audio: false,
                video: {
                    width: {
                        ideal: 1920
                    },
                    height: {
                        ideal: 1080
                    }
                }
            };
        }
    }
}