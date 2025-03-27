const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = 8080;

// Serve static files (ensure this path is correct)
app.use(express.static(path.join(__dirname, "../frontend")));

// Add CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// WebSocket Server
const wss = new WebSocket.Server({ port: 8081 });

let messages = []; // Store chat messages
let sensorData = {}; // Store the latest sensor data
let controlState = { led: false, pump: false }; // Store control states

wss.on("connection", (ws) => {
    console.log("WebSocket client connected"); // Debug log

    // Send previous messages, sensor data, and control states to the newly connected client
    ws.send(JSON.stringify({ type: "previousMessages", data: messages }));
    console.log("Sending initial sensor data:", sensorData); // Debug log
    ws.send(JSON.stringify({ type: "sensorData", data: sensorData }));
    console.log("Sending initial control state:", controlState); // Debug log
    ws.send(JSON.stringify({ type: "controlState", data: controlState }));

    ws.on("message", (message) => {
        try {
            const messageStr = message.toString(); // Convert Buffer to String
            console.log("Received:", messageStr); // Debug log
            const jsonMessage = JSON.parse(messageStr);

            if (jsonMessage.type === "chat") {
                messages.push(jsonMessage);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(jsonMessage));
                    }
                });
            } else if (jsonMessage.type === "sensorData") {
                sensorData = jsonMessage.data;
                console.log("Updated sensor data:", sensorData); // Debug log
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "sensorData", data: sensorData }));
                    }
                });
            } else if (jsonMessage.type === "control") {
                if (jsonMessage.action === "toggle_led") {
                    controlState.led = !controlState.led;
                } else if (jsonMessage.action === "toggle_pump") {
                    controlState.pump = !controlState.pump;
                }
                console.log(`Control state updated:`, controlState);

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: "controlState", data: controlState }));
                    }
                });

                ws.send(JSON.stringify({ type: "controlResponse", action: jsonMessage.action, status: "success" }));
            }
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    });

    ws.on("close", () => console.log("WebSocket client disconnected"));
});

app.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`); // Debug log
    console.log("WebSocket Server running on ws://localhost:8081"); // Debug log
});
