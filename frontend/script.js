const ws = new WebSocket("ws://localhost:8081");

ws.onopen = () => {
    console.log("Connected to WebSocket Server");
    document.getElementById("ws-status").textContent = "🟢 Connected";
};

// Function to update button state and color
function updateButtonState(buttonId, isActive) {
    const button = document.getElementById(buttonId);
    if (isActive) {
        button.style.backgroundColor = "#27ae60"; // Green for true
        button.textContent = buttonId === "led-btn" ? "LED ON" : "Pump ON";
    } else {
        button.style.backgroundColor = "#e74c3c"; // Red for false
        button.textContent = buttonId === "led-btn" ? "LED OFF" : "Pump OFF";
    }
}

// Function to toggle button state and send WebSocket command
function toggleButtonState(buttonId, action) {
    const button = document.getElementById(buttonId);
    const isActive = button.style.backgroundColor === "rgb(39, 174, 96)"; // Check if green (ON)
    const newState = !isActive;

    // Update button state locally
    updateButtonState(buttonId, newState);

    // Send WebSocket command to toggle state
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "control", action: action }));
    } else {
        console.error("WebSocket is not open!");
    }
}

// Add event listeners to buttons
document.getElementById("led-btn").addEventListener("click", () => {
    toggleButtonState("led-btn", "toggle_led");
});

document.getElementById("pump-btn").addEventListener("click", () => {
    toggleButtonState("pump-btn", "toggle_pump");
});

ws.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);

        if (message.type === "sensorData") {
            document.getElementById("temperature").textContent = message.data.temperature;
            document.getElementById("humidity").textContent = message.data.humidity;
            document.getElementById("ph").textContent = message.data.ph;
            document.getElementById("light").textContent = message.data.light;
            console.log("Updated webpage with sensor data:", message.data);
        }

        if (message.type === "controlState") {
            updateButtonState("led-btn", message.data.led);
            updateButtonState("pump-btn", message.data.pump);
        }
    } catch (error) {
        console.error("Error parsing WebSocket message:", error);
    }
};

ws.onerror = (error) => {
    console.error("WebSocket Error:", error);
};

ws.onclose = () => {
    console.log("WebSocket Disconnected");
    document.getElementById("ws-status").textContent = "🔴 Disconnected";
};
