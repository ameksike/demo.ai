export class StreamingAudioPlayer {
    constructor() {
        this.audioContext = new AudioContext();
        this.audioQueue = [];
        this.isPlaying = false;
        this.initAudioWorklet();
    }

    async initAudioWorklet() {
        await this.audioContext.audioWorklet.addModule("audio.processor.js");
        this.audioNode = new AudioWorkletNode(this.audioContext, "audio-stream-processor");
        this.audioNode.connect(this.audioContext.destination);
    }

    async play(base64Audio) {
        const audioBuffer = await this.decodeAudio(base64Audio);
        const rawData = audioBuffer.getChannelData(0);
        this.audioNode.port.postMessage(rawData);
    }

    async decodeAudio(base64Audio) {
        const arrayBuffer = await fetch(`data:audio/wav;base64,${base64Audio}`).then(res => res.arrayBuffer());
        return this.audioContext.decodeAudioData(arrayBuffer);
    }
}

/**
// Uso en WebSocket
const player = new StreamingAudioPlayer();
const ws = new WebSocket("ws://localhost:3000");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.audio) player.play(data.audio);
};
 */