// AISWorker.js
// WebSocket endpoint for AIS Stream
import Logger from './Logger.js';
import { parentPort } from 'worker_threads';
import WebSocket from 'ws'; // Using ES module syntax
import { getBoundingBoxes, getBoatMMSIData } from './Utils.js';

const API_URL = "wss://stream.aisstream.io/v0/stream"; // WebSocket endpoint for AIS Stream
let socket = null;
const logger = new Logger();

// Handle messages from the main thread
parentPort.on('message', (data) => {
    const { command, apiKey } = data;

    if (command === "connect") {
        // Establish WebSocket connection
        socket = new WebSocket(API_URL);

        socket.on('open', () => {
            logger.info("Connected to AIS Stream WebSocket");

            let subscriptionMessage = {
                Apikey: apiKey,
                BoundingBoxes: getBoundingBoxes(),
                FiltersShipMMSI: getBoatMMSIData(),
                FilterMessageTypes: ["PositionReport"]
            };
            logger.debug("Sending subscription message: " + JSON.stringify(subscriptionMessage));
            socket.send(JSON.stringify(subscriptionMessage));
        });

        socket.on('message', (event) => {
            const message = JSON.parse(event);
            logger.debug("Received message: " + event);

            // Handle incoming data and send it back to the main thread
            if (message.type === "vesselData") {
                parentPort.postMessage({
                    type: "vesselData",
                    data: message.data
                });
            }
        });

        socket.on('close', () => {
            logger.info("Disconnected from AIS Stream WebSocket");
            parentPort.postMessage({ type: "disconnected" });
        });

        socket.on('error', (error) => {
            logger.error("WebSocket error:", error);
            parentPort.postMessage({ type: "error", error: error });
        });
    }

    if (command === "disconnect" && socket) {
        socket.close();
    }
});
