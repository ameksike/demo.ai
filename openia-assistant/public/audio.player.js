export class StreamingAudioPlayer {
    constructor(options) {
        this.script = {
            key: "audio-stream-processor",
            src: "/public/audio.processor.js"
        }
        this.context = null;
        this.analyser = null;
        this.isPlaying = false;
        this.sampleRate = options?.sampleRate || 48000;
        this.audioQueue = [];
        this.trackSampleOffsets = {};
        this.interruptedTrackIds = {};
        this.recordedChunks = [];
        this.onEnd = options?.onEnd instanceof Function ? options?.onEnd : null
        this.init();
    }

    getRecorded() {
        return this.recordedChunks;
    }

    cleanRecorded() {
        delete this.recordedChunks;
        this.recordedChunks = [];
    }

    /**
     * Connects the audio context and enables output to speakers
     * @returns {Promise<true>}
     */
    async connect(options) {
        try {
            if (this.context) {
                return this.context;
            }

            const stream = options?.stream || await navigator.mediaDevices.getUserMedia({ audio: true });
            this.context = new AudioContext({ sampleRate: this.sampleRate });
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            this.analyser = this.context.createAnalyser();
            this.analyser.fftSize = 8192;
            this.analyser.smoothingTimeConstant = 0.1;
            return true;
        }
        catch (err) {
            console.error("StreamingAudioPlayer:connect", err);
            this.context = null;
        }
    }

    /**
     * Starts audio streaming
     * @private
     * @returns {Promise<AudioWorkletNode|null>}
     */
    async init() {
        try {
            if (this.audioNode && this.context) {
                return this.audioNode;
            }
            await this.connect();
            await this.context.audioWorklet.addModule(this.script.src);
            this.audioNode = new AudioWorkletNode(this.context, this.script.key);
            this.audioNode.connect(this.context.destination);
            this.audioNode.port.onmessage = (e) => {
                const { event } = e.data;
                if (event === 'stop') {
                    this.audioNode.disconnect();
                    this.audioNode = null;
                    if (this.onEnd instanceof Function) {
                        this.onEnd(this.getRecorded(), this.sampleRate);
                        this.cleanRecorded();
                    }
                } else if (event === 'offset') {
                    const { requestId, trackId, offset } = e.data;
                    const currentTime = offset / this.sampleRate;
                    this.trackSampleOffsets[requestId] = { trackId, offset, currentTime };
                }
            };
            // this.analyser.disconnect();
            // streamNode.connect(this.analyser);

            console.log("StreamingAudioPlayer:init", this.context.destination);
            return this.audioNode;
        }
        catch (error) {
            console.error("StreamingAudioPlayer:init", error);
            return null;
        }
    }

    /**
     * Adds 16BitPCM data to the currently playing audio stream
     * You can add chunks beyond the current play point and they will be queued for play
     * @param {ArrayBuffer|Int16Array} arrayBuffer
     * @param {string} [trackId]
     * @returns {Int16Array}
     */
    async play(audio, trackId = 'default') {
        if (typeof trackId !== 'string') {
            throw new Error(`trackId must be a string`);
        } else if (this.interruptedTrackIds[trackId]) {
            return;
        }
        console.log("StreamingAudioPlayer:play", { audio, trackId });
        const audioBuffer = typeof audio === "string" ? await this.decodeAudio(audio) : audio;
        const rawData = audioBuffer.getChannelData ? audioBuffer.getChannelData(0) : audioBuffer;
        await this.init();

        let buffer;
        if (rawData instanceof Int16Array) {
            buffer = rawData;
        } else if (rawData instanceof ArrayBuffer) {
            buffer = new Int16Array(rawData);
        } else {
            throw new Error(`argument must be Int16Array or ArrayBuffer`);
        }

        this.recordedChunks.push(buffer);
        this.audioNode.port.postMessage({ event: 'write', buffer, trackId });
    }

    async decodeAudio(base64Audio) {
        const arrayBuffer = await fetch(`data:audio/wav;base64,${base64Audio}`).then(res => res.arrayBuffer());
        return this.context.decodeAudioData(arrayBuffer);
    }
}