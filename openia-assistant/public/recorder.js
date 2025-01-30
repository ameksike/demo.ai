
export class WebRec {

    constructor() {
        this.chunks = [];
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
            onEnd instanceof Function && onEnd(blobs, url)
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
            onEnd instanceof Function && onEnd(e.data);
        })
    }

    async start(options) {
        const { onData, timeslice = 500 } = options || {};
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.rec = new MediaRecorder(stream);
        // Send audio data as chunks via WebSocket
        this.rec.ondataavailable = (event) => {
            if (event.data.size > 0) {
                // Send audio Blob
                this.chunks.push(event.data);
                onData instanceof Function && onData(event.data)
            }
        };
        // Start recording in chunks
        this.rec.start(timeslice);
    }

    stop(options) {
        const { onEnd, timeslice = 500 } = options || {};
        this.rec?.stop(timeslice);
        onEnd instanceof Function && onEnd(this.chunks);
        this.chunks = [];
    }

    asBlob(chunks, options) {
        const { type = "audio/webm; codecs=opus" } = options || {};
        return new Blob(chunks, { type });
    }

    createUiAudio(chunks, options) {
        const audio = document.createElement("audio");
        const blob = this.asBlob(chunks, options);
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
}