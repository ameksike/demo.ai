
export class WebRec {

    constructor() {
        this.chunks = [];
    }

    run(action, params = [], scope = {}) {
        try {
            if (!(action instanceof Function)) {
                return null;
            }
            params = !params || Array.isArray(params) ? params : [params];
            return action.apply(scope, params);
        }
        catch (error) {
            return null;
        }
    }

    asBlob(chunks, options) {
        const { type = "audio/webm; codecs=opus" } = options || {};
        return new Blob(chunks, { type });
    }

    mergeAudioStreams(desktopStream, voiceStream) {
        const context = new AudioContext();
        const destination = context.createMediaStreamDestination();
        let hasDesktop = false;
        let hasVoice = false;
        if (desktopStream && desktopStream.getAudioTracks().length > 0) {
            // If you don't want to share Audio from the desktop it should still work with just the voice.
            const source1 = context.createMediaStreamSource(desktopStream);
            const desktopGain = context.createGain();
            desktopGain.gain.value = 0.7;
            source1.connect(desktopGain).connect(destination);
            hasDesktop = true;
        }

        if (voiceStream && voiceStream.getAudioTracks().length > 0) {
            const source2 = context.createMediaStreamSource(voiceStream);
            const voiceGain = context.createGain();
            voiceGain.gain.value = 0.7;
            source2.connect(voiceGain).connect(destination);
            hasVoice = true;
        }

        return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
    };

    async stream(options) {
        let { onEnd } = options || {};
        let [desktop, voice] = Promise.all([
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }),
            navigator.mediaDevices.getUserMedia({ video: false, audio: true })
        ]);
        let blobs = [];
        let tracks = [
            ...desktop.getVideoTracks(),
            ...this.mergeAudioStreams(desktop, voice)
        ];
        let stream = new MediaStream(tracks);
        let rec = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
        rec.ondataavailable = (e) => blobs.push(e.data);
        rec.onstop = async () => {
            let blob = new Blob(blobs, { type: 'video/webm' });
            let url = window.URL.createObjectURL(blob);
            this.run(onEnd, [blobs, url]);
            // onEnd instanceof Function && onEnd(blobs, url)
        };
    }

    async screen(options) {
        const { frameRate = 30, code = "video/webm;codecs=vp8,opus", onEnd } = options || {};
        const media = await navigator.mediaDevices.getDisplayMedia({
            audio: { echoCancellation: false },
            video: { frameRate: { ideal: frameRate } }
        })
        const rec = new MediaRecorder(media, {
            mineType: code
        });
        rec.start();
        const [video] = media.getVideoTracks();
        video.addEventListener("ended", () => {
            rec.stop()
        });
        rec.addEventListener("dataavailable", (e) => {
            this.run(onEnd, [e.data]);
            // onEnd instanceof Function && onEnd(e.data);
        })
    }

    async start(options) {
        const { onData, onEnd, timeslice = 100 } = options || {};
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.rec = new MediaRecorder(stream);
        // Send audio data as chunks via WebSocket
        this.rec.ondataavailable = (event) => {
            if (event.data.size > 0) {
                // Send audio Blob
                this.chunks.push(event.data);
                this.run(onData, event.data);
            }
        };
        this.rec.onstop = async () => {
            console.log("ONNNN STOP")
            this.run(onEnd, [this.chunks]);
            this.chunks = [];
        };
        // Start recording in chunks
        this.rec.start(timeslice);
        return this;
    }

    stop() {
        console.log("STOPING")
        this.rec?.stop();
        //onEnd instanceof Function && onEnd(this.chunks);
        return this;
    }

    createUiAudio(chunks, options) {
        const audio = document.createElement("audio");
        const blob = Array.isArray(chunks) ? this.asBlob(chunks, options) : chunks;
        audio.src = URL.createObjectURL(blob);
        audio.controls = true;
        return audio;
    }

    createUiLink(chunk, options) {
        const { fileName = "screen.webm", auto = true } = options || {};
        const link = document.createElement("a");
        link.href = URL.createObjectURL(chunk);
        link.download = fileName;
        auto && link.click();
    }


    async streams(e) {
        // Create a peer connection
        const pc = new RTCPeerConnection();

        // Set up to play remote audio from the model
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        pc.ontrack = e => audioEl.srcObject = e.streams[0];

        // Add local audio track for microphone input in the browser
        const ms = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
        pc.addTrack(ms.getTracks()[0]);
        return audioEl;
    }

    async blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result.split(",")[1]);
        });
    }

    async playAudio(base64Audio) {
        const audioBuffer = await this.audioContext.decodeAudioData(
            await (await fetch(`data:audio/wav;base64,${base64Audio}`)).arrayBuffer()
        );
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start();
    }
}