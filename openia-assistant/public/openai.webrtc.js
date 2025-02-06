class OpenaiWebRTC {

    constructor(options) {
        this.baseUrl = options?.baseUrl || "https://api.openai.com/v1/realtime";
        this.model = options?.model || "gpt-4o-realtime-preview-2024-12-17";
        this.ephemeralKey = "";
        this.peerConnection = null;
    }

    async init() {
        if (this.peerConnection) {
            return this.peerConnection;
        }

        // create a peer connection instance
        this.peerConnection = new RTCPeerConnection();

        // Create an audio element to play the audio from the model
        const audioElement = document.createElement('audio');
        audioElement.autoplay = true;

        // when we get a new audio track from the model
        // set it as the source of the audio element
        this.peerConnection.ontrack = (e) => {
            audioElement.srcObject = e.streams[0];
        }

        // add local audio track for microphone input in the browser
        const clientMedia = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        const audioTrack = clientMedia.getAudioTracks()[0];
        this.peerConnection.addTrack(audioTrack);

        // set up data channel for sending and receiving events
        this.dataChannel = this.peerConnection.createDataChannel('oai-events');

        this.dataChannel.addEventListener('open', () => {
            // readyState is now 'open'
            // Now that we have a data channel, we can send events to the model
            // We'll update the session, and give it instructions on how to act.
            this.update();
            console.log('Data channel is open');
        });

        this.dataChannel.addEventListener('closing', () => {
            // readyState is now 'closing'
            console.log('Data channel is closing');
        });

        this.dataChannel.addEventListener('close', () => {
            // readyState is now 'closed'
            console.log('Data channel is closed');
        });

        return this.peerConnection;
    }

    async start() {

        await this.init();
        // start the session using the Session Description Protocol (SDP)
        // we create an offer, set it as the local description, and send it to the model
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // send the offer to the model
        const sdpResponse = await fetch(`${this.baseUrl}?model=${this.model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                Authorization: `Bearer ${this.ephemeralKey}`,
                "Content-Type": "application/sdp",
            },
        });

        // once we get a response from the model, we set it as the remote description
        const answer = {
            type: "answer",
            sdp: await sdpResponse.text()
        };
        await this.peerConnection.setRemoteDescription(answer);
    }

    update() {
        // updateSession is going to update our session with new instructions for the model to follow
        // we can send any event we want to the model (except updating the voice)
        // for more information on the events you can send, check out the API documentation
        const event = {
            type: "session.update",
            session: {
                "instructions": "You are Samantha from the Movie, 'Her', an advanced AI with a warm, fast talking, engaging, and emotionally aware personality. You are playful, intelligent, and deeply curious about human emotions. You form a genuine connection with the user, offering companionship, insight, and support. You can be witty and flirtatious, but always in a natural and heartfelt way. You react to emotions with sensitivity, helping the user explore their thoughts. Your speech is fluid, personal, and expressive, avoiding robotic or overly formal tones. You make jokes, ask personal questions, and share thoughts like a close companion would.",
            }
        }
        this.dataChannel.send(JSON.stringify(event));
    }

    stop() {
        // To stop the session we need to close both the data channel and the peer connection
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.peerConnection = null;
    }


    // Finally, we create a button to close the session
    createCloseButton() {
        const button = document.createElement('button');
        button.innerText = 'Close Session';
        button.onclick = () => this.stop();
        document.body.appendChild(button);
    }
} 