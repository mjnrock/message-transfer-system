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

            streams: {
                video: null,
                audio: null,
                screen: null,
                canvas: null
            },
            videos: {
                audio: document.createElement("video").setAttribute("autoplay", true),
                video: document.createElement("video").setAttribute("autoplay", true),
                screen: document.createElement("video").setAttribute("autoplay", true),
                canvas: document.createElement("video").setAttribute("autoplay", true)
            }
        };

        this.video.setAttribute("autoplay", true);
    }
    
    
    get streams() {
        return this._config.streams;
    }
    get videos() {
        return this._config.videos;
    }

    get $video() {
        return this._config.streams.video;
    }
    set $video(value) {
        this._config.feeds.video = value;
        this.videos.video.srcObject = value;
    }
    get $audio() {
        return this._config.streams.audio;
    }
    set $audio(value) {
        this._config.feeds.audio = value;
        this.videos.audio.srcObject = value;
    }
    get $screen() {
        return this._config.streams.screen;
    }
    set $screen(value) {
        this._config.streams.screen = value;
        this.videos.screen.srcObject = value;
    }
    get $canvas() {
        return this._config.streams.canvas;
    }
    set $canvas(value) {
        this._config.streams.canvas = value;
        this.videos.canvas.srcObject = value;
    }

    getUserMedia({ callback, constraints } = {}) {
        let cons = constraints || this.getDefaultConstraints();

        navigator.mediaDevices.getUserMedia(cons)
            .then(stream => {                    
                if(stream.getAudioTracks().length) {
                    if(this.$audio) {
                        this.$audio.getTracks().forEach(track => track.stop());
                    }

                    this.$audio = stream;
                }
                if(stream.getVideoTracks().length) {
                    if(this.$video) {
                        this.$video.getTracks().forEach(track => track.stop());
                    }

                    this.$video = stream;
                }

                this.getMediaDevices();

                return stream;
            })
            .then(stream => {
                if(typeof callback === "function") {
                    callback(stream);
                }

                return stream;
            })
            .catch(e => console.log(e));
    }
    
    // getDisplayMedia({ callback, constraints } = {}) {
    //     let { video, audio } = this.getDefaultConstraints(),
    //         cons = constraints || video;

    //     if(this.screen) {
    //         this.screen.getTracks().forEach(track => track.stop());
    //     }

    //     navigator.mediaDevices.getDisplayMedia(cons)
    //         .then(stream => {
    //             if(stream.getVideoTracks().length) {
    //                 this.tracks.screen = stream.getVideoTracks()[ 0 ];
    //                 this.tracks.screen.applyConstraints(cons.video);
    //             } else {
    //                 this.tracks.screen = null;
    //             }

    //             this.screen = stream;

    //             return stream;
    //         })
    //         .then(stream => {
    //             if(typeof callback === "function") {
    //                 callback(stream);
    //             }

    //             return stream;
    //         })
    //         .then(stream => {
    //             if(!this.media) {
    //                 navigator.mediaDevices.getUserMedia({ audio, video: false })
    //                     .then(vox => {
    //                         if(vox.getAudioTracks().length) {        
    //                             this.tracks.audio = vox.getAudioTracks()[ 0 ];
    //                             this.tracks.audio.applyConstraints(cons.audio);
    //                         }

    //                         this.media = vox;
                            
    //                         if(typeof callback === "function") {
    //                             callback(stream);
    //                         }

    //                         return stream;
    //                     })
    //             }

    //             return stream;
    //         })
    //         .catch(e => console.log(e));
    // }

    getTrack(search, type = MediaStreamNode.TrackType.AUDIO) {
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
    addTrack(search, type = MediaStreamNode.TrackType.AUDIO, setAsMain = true) {
        let track = this.getTrack(type, search);

        if(track && this.stream) {
            this.stream.addTrack(track);

            if(setAsMain === true) {
                this._config.tracks[ type ] = track;
            }

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

    getCurrentAudioDevice() {
        return this.getAudioDevice(
            this.tracks.audio
        );
    }
    getCurrentVideoDevice() {
        return this.getVideoDevice(
            this.tracks.video
        );
    }

    useDevice(device, { callback, constraints }) {
        if(device) {
            let cons = constraints || this.getDefaultConstraints(),
                type;

            if(device.type === "audioinput") {
                type = "audio";
                cons.video = false;
            } else if(device.type === "videoinput") {
                type = "video";
                cons.audio = false;
            }

            cons[ type ].deviceId = { exact: device.id };

            this.getUserMedia({ callback, constraints: cons });
        }
    }
    
    get tracks() {
        return this._config.tracks;
    }
    muteTrack(type = MediaStreamNode.TrackType.AUDIO) {
        if(this.tracks[ type ]) {
            this.tracks[ type ].enabled = false;
        }
    }
    unmuteTrack(type = MediaStreamNode.TrackType.AUDIO) {
        if(this.tracks[ type ]) {
            this.tracks[ type ].enabled = true;
        }
    }
    toggleTrack(type = MediaStreamNode.TrackType.AUDIO) {
        if(this.tracks[ type ]) {
            this.tracks[ type ].enabled = !this.tracks[ type ].enabled;
        }
    }

    toggleAudio() {
        this.toggleTrack(MediaStreamNode.TrackType.AUDIO);
    }
    toggleVideo() {
        this.toggleTrack(MediaStreamNode.TrackType.VIDEO);
    }
    toggleScreen() {
        this.toggleTrack(MediaStreamNode.TrackType.SCREEN);
    }
    toggleCanvas() {
        this.toggleTrack(MediaStreamNode.TrackType.CANVAS);
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

    cloneElement() {
        return this.video.cloneNode(true);
    }
}