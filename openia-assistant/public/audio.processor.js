class AudioStreamProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];
        this.port.onmessage = (event) => this.buffer.push(event.data);
    }

    process(inputs, outputs) {
        if (this.buffer.length > 0) {
            let output = outputs[0];
            output[0].set(this.buffer.shift());
        }
        return true;
    }
}

registerProcessor("audio-stream-processor", AudioStreamProcessor);
