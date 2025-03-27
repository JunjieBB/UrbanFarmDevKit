const ws = new WebSocket("ws://localhost:8081");

ws.onopen = () => {
    console.log("WebSocket Connected");
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "chat") {
        addMessageToChat(data.username, data.message);
    } else if (data.type === "previousMessages") {
        data.data.forEach(msg => addMessageToChat(msg.username, msg.message));
    }
};

document.getElementById("send-btn").addEventListener("click", () => {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();
    if (message) {
        const chatMessage = { type: "chat", username: "User", message };
        ws.send(JSON.stringify(chatMessage));
        messageInput.value = "";
    }
});

function addMessageToChat(username, message) {
    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("p");
    newMessage.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatBox.appendChild(newMessage);
}
