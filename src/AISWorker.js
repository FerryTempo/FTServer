// AISWorker.js
// WebSocket endpoint for AIS Stream
import Logger from './Logger.js';
import { parentPort } from 'worker_threads';
import WebSocket from 'ws'; // Using ES module syntax
import { getBoundingBoxes, getBoatMMSIList, handleShipProgress, getFTData, updateAISData } from './RouteUtilities.js';

const ASI_URL = "wss://stream.aisstream.io/v0/stream"; // WebSocket endpoint for AIS Stream
let aisSocket = null;
let reconnectTimer = null;
let activityInterval = null;
let updateInterval = null;
let savedApiKey = null;
let manualDisconnect = false;
let reconnectDelay = 10 * 1000;
const logger = new Logger();
let latestActivityTime = new Date();

// Handle messages from the main thread
parentPort.on('message', (data) => {
    const { command, apiKey, boatData } = data;

    if (command === "connect") {
        savedApiKey = apiKey;
        manualDisconnect = false;
        if (!activityInterval) {
            activityInterval = setInterval(checkForActivity, 60 * 1000);
        }
        if (!updateInterval) {
            updateInterval = setInterval(updateParent, 60 * 1000);
        }
        connectToAis(apiKey);
    }

    if (command === "disconnect") {
        manualDisconnect = true;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (aisSocket) {
            aisSocket.close();
        }
        if (activityInterval) {
            clearInterval(activityInterval);
            activityInterval = null;
        }
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }

    if (command === "update") {
        logger.info("Received update command from main thread: " + JSON.stringify(boatData));
        updateAISData(boatData);
    }
});

/**
 * Opens a WebSocket with aisstream.io
 */
function connectToAis(apiKey) {
    const key = apiKey || savedApiKey;
    if (!key) {
        logger.error('AIS worker has no API key, cannot connect.');
        return;
    }
    if (manualDisconnect) {
        logger.debug('AIS worker is manually disconnected; skipping reconnect.');
        return;
    }

    latestActivityTime = new Date();
    if (aisSocket != null) {
        if (aisSocket.readyState === WebSocket.OPEN || aisSocket.readyState === WebSocket.CONNECTING) {
            return;
        }
        if (aisSocket.readyState === WebSocket.CLOSING) {
            return;
        }
        aisSocket = null;
    }

    aisSocket = new WebSocket(ASI_URL);

    //  When the socket to aisstream.io opens, subscribe for messages.
    //  When it closes, wait 10 seconds then re-connect.
    //  Ignore errors, the 'close' signal is also issued.
    aisSocket.onopen = () => {
        reconnectDelay = 10 * 1000;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        latestActivityTime = new Date();
        subscribe(key);
    };
    aisSocket.onclose = () => {
        const wasManual = manualDisconnect;
        aisSocket = null;
        if (wasManual) {
            logger.info('AIS socket closed due to manual disconnect.');
            return;
        }
        logger.error(`Connection to aisstream.io closed, attempting reconnect in ${reconnectDelay / 1000} seconds...`);
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
        }
        reconnectTimer = setTimeout(() => connectToAis(), reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 300 * 1000);
    };
    aisSocket.onerror = (error) => {
        logger.error('Error connecting to aisstream.io:', error);
        if (aisSocket && aisSocket.readyState === WebSocket.OPEN) {
            aisSocket.close();
        }
    };
    aisSocket.onmessage = (event) => {
        aisMessageHandler(event.data);
    };
};

/**
 * Sends a subscription message to aisstream.io, asking
 * them to start sending us PositionReport data.
 */
function subscribe(apiKey) {
    if (!aisSocket || aisSocket.readyState !== WebSocket.OPEN) {
        logger.error('Cannot subscribe: AIS socket is not open.');
        return;
    }
    let subscriptionMessage = {
        Apikey: apiKey,
        BoundingBoxes: getBoundingBoxes(),
        FiltersShipMMSI: getBoatMMSIList(),
        FilterMessageTypes: ["PositionReport"]
    };
    //logger.debug("Sending subscription message: " + JSON.stringify(subscriptionMessage));
    aisSocket.send(JSON.stringify(subscriptionMessage));
};

/**
 * Receives updates from aisstream.io
 */
function aisMessageHandler(message) {
    latestActivityTime = new Date(); // Note that the connection is alive
    try {
        const aisMessage = JSON.parse(message);
        handleShipProgress(aisMessage);
    } catch (error) {
        logger.error('Failed to parse AIS message or handle ship progress:', error);
    }
};

/**
 * Checks if we are (still) getting updates from aisstream.io
 *
 * If we have had no interaction with aisserver.io for a long
 * time, attempts to reconnect.
 */
function checkForActivity() {
    const maxIdleTime = 5 * 60 * 1000;  // 5 minutes
    const now = new Date();

    if (now - latestActivityTime > maxIdleTime) {
        latestActivityTime = now;
        connectToAis();
    }
};

/**
 * Sends a message to the main thread on a periodic basis
 * 
 */
function updateParent() {
    const data = getFTData();
    parentPort.postMessage({ type: "vesselData", data: data });
}
