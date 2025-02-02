class StreamingAudio {
    constructor() {
        this.audioElement = document.createElement("audio");
        this.mediaSource = new MediaSource();
        this.sourceBuffer = null;

        this.audioElement.src = URL.createObjectURL(this.mediaSource);
        document.body.appendChild(this.audioElement);

        this.mediaSource.addEventListener("sourceopen", () => {
            this.sourceBuffer = this.mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
        });
    }

    async play(base64Audio) {
        if (!this.sourceBuffer) return;

        const arrayBuffer = await fetch(`data:audio/webm;base64,${base64Audio}`).then(res => res.arrayBuffer());

        if (!this.sourceBuffer.updating) {
            this.sourceBuffer.appendBuffer(new Uint8Array(arrayBuffer));
        }
    }
}
/*
// Uso con WebSocket
const player = new StreamingAudio();
const ws = new WebSocket("ws://localhost:3000");

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.audio) player.play(data.audio);
};
*/