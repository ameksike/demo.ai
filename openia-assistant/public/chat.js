import { WebRec } from './recorder.js';
import { WsClient } from './ws.client.js';

const ws = new WsClient();
const mr = new WebRec();

// CHAT COMPONENTS
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const startBtn = document.getElementById('startBtn');
// const stopBtn = document.getElementById('stopBtn');
const videoBtn = document.getElementById('videoBtn');
const chatDiv = document.getElementById('chat-container');


// CONNECTION COMPONENTS
const connDiv = document.getElementById('conn-container');
const connForm = document.getElementById("connForm");
const configInput = document.getElementById("configInput");

ws.configure({
    url: "ws://localhost:8080",
    onError: (error) => {
        console.log(error);
        uiShow(false);
    },
    onClose: () => {
        uiShow(false);
    },
    onConnected: () => {
        uiShow(true);
    },
    onMessage: (event) => {
        console.log("onMessage", event.data);
        addMessage(event.data, "assistant", messagesDiv);
    },
    onToken: (token) => btoa(token).replace(/=/g, "")
})

// CONNECTION EVENTS 
connForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const config = configInput.value.trim();
    ws.connect({ token: config });
});

document.getElementById('disconnectBtn')?.addEventListener('click', (event) => {
    ws.disconnect();
});

// CHAT EVENTS

function addMessage(text, sender, messagesDiv) {
    const messageBox = document.createElement("span");
    const messageTxt = document.createElement("span");
    const messageDiv = document.createElement("div");

    messageTxt.textContent = text;
    messageTxt.className = "msg-txt";
    messageBox.className = "msg-box";
    messageDiv.className = `message ${sender}`;

    //messageDiv.textContent = text;
    messageBox.appendChild(messageTxt);
    messageDiv.appendChild(messageBox);
    // parent
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
};

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, "user", messagesDiv);
        ws.send(message);
        chatInput.value = "";
    }
});

const state = {
    rec: false
}
startBtn.addEventListener('click', (event) => {
    if (state?.rec) {
        console.log("REC: Stop recording", state?.rec);
        mr.stop({
            onEnd: (chunks) => {
                messagesDiv.appendChild(mr.createUiAudio(chunks));
                // ws.send(mr.asBlob(chunks));
                startBtn.innerHTML = "REC Start";
                state.rec = false;
            }
        });
    } else {
        console.log("REC: Start recording", state?.rec);
        mr.start({
            onData: (blob) => {
                ws.send(blob);
                // console.log("Audio: ", blob)
                //blob && ws.readyState === WebSocket.OPEN && ws.send(blob);
                startBtn.innerHTML = "REC Stop";
                state.rec = true;
            }
        })
    }
});
/*
stopBtn.addEventListener('click', () => {
    mr.stop({
        onEnd: (chunks) => {
            messagesDiv.appendChild(mr.createUiAudio(chunks));
            startBtn.innerHTML = "Start Recording";
            ws.send(this.asBlob(chunks));
        }
    });
    startBtn.disabled = false;
    stopBtn.disabled = true;
});*/

videoBtn.addEventListener('click', () => {
    console.log("VIIIIIIIIIIII")
    mr.screen({
        onEnd: (chunk) => {
            mr.createUiLink(chunk);
        }
    });
});

function uiShow(isConnected) {
    if (isConnected) {
        chatDiv.style.display = "block";
        connDiv.style.display = "none";
    } else {
        chatDiv.style.display = "none";
        connDiv.style.display = "block";
        messagesDiv.innerHTML = "";
    }
}