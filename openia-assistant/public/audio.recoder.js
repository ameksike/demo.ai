export class AudioRecorders {
    constructor(options) {
        this.sampleRate = options?.sampleRate || 44100;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate });
        this.mediaStream = null;
        this.processor = null;
        this.recording = false;
        this.audioData = [];

        this.onEnd = options?.onEnd;
        this.onData = options?.onData;
    }

    async start() {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (event) => {
            if (!this.recording) return;
            const inputBuffer = event.inputBuffer.getChannelData(0);
            this.audioData.push(new Float32Array(inputBuffer));
        };

        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        this.recording = true;
    }

    stop() {
        if (!this.recording) return;
        this.recording = false;
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.processor.disconnect();
        this.audioContext.close();
    }

    getAudioFloat32Array() {
        return Float32Array.from(this.audioData.flat());
    }
}

export default AudioRecorder;
