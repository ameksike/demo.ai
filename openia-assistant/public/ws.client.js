const ws = new WebSocket("ws://localhost:8080");
const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

const addMessage = (text, sender) => {
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
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Auto-scroll
};

ws.onmessage = (event) => {
    addMessage(event.data, "assistant");
};

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        addMessage(message, "user");
        ws.send(message);
        chatInput.value = "";
    }
});
