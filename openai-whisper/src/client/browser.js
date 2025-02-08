// browser.js

const btn = document.getElementById('startRecording');

const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
};

const startRecording = () => {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = async () => {
        console.log('WebSocket connection established');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const recorder = RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            sampleRate: 16000, // 16 kHz
            numberOfAudioChannels: 1, // Mono
            bufferSize: 16384,
            desiredSampRate: 16000,
            recorderType: StereoAudioRecorder,
            timeSlice: 1000, // Enviar chunks cada 1 segundo
            ondataavailable: (blob) => {
                socket.send(blob); // Enviar el chunk de audio al servidor
            },
        });

        recorder.startRecording();

        setTimeout(() => {
            console.log("Stoping")
            recorder.stopRecording(() => {
                stream.getTracks().forEach(track => track.stop()); // Detener la grabación
                socket.close(); // Cerrar la conexión WebSocket
            });
        }, 10000); // Detener después de 10 segundos (ajusta según sea necesario)
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'transcription') {
            console.log('Transcripción del usuario:', data.text);
        } else if (data.type === 'assistant') {
            console.log('Respuesta del asistente:', data.text);
            const audioBlob = new Blob([data.audio], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            playAudio(audioUrl); // Reproducir el audio del asistente
        }
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
};

btn.addEventListener('click', startRecording);