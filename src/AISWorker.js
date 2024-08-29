// AISWorker.js
// WebSocket endpoint for AIS Stream
import Logger from './Logger.js';
import { parentPort } from 'worker_threads';
import WebSocket from 'ws'; // Using ES module syntax
import { getBoundingBoxes, getBoatMMSIList, handleShipProgress } from './RouteUtilities.js';
import { readRouteAssignments } from './RouteData.js';

const ASI_URL = "wss://stream.aisstream.io/v0/stream"; // WebSocket endpoint for AIS Stream
let aisSocket = null;
const logger = new Logger();
let latestActivityTime = new Date();

// Handle messages from the main thread
parentPort.on('message', (data) => {
    const { command, apiKey } = data;

    if (command === "connect") {
        setInterval(checkForActivity, 60 * 1000);
        readRouteAssignments();
        connectToAis(apiKey);
    }

    if (command === "disconnect" && socket) {
        socket.close();
    }
});

/**
 * Opens a WebSocket with aisstream.io
 */
function connectToAis(apiKey) {
    latestActivityTime = new Date();
    if (aisSocket != null) {
        if (aisSocket.readyState == aisSocket.OPEN) {
            aisSocket.close();
            aisSocket = null;
            return;
        }
        if (aisSocket.readyState != aisSocket.CLOSED) {
            // State should be CONNECTING or CLOSING, we should
            // get another callback soon
            return;
        }
        // Closed
        aisSocket = null;
        // Fall through
    }

    aisSocket = new WebSocket(ASI_URL);

    //  When the socket to aisstream.io opens, subscribe for messages.
    //  When it closes, wait 10 seconds then re-connect.
    //  Ignore errors, the 'close' signal is also issued.
    aisSocket.onopen = () => { subscribe(apiKey); };
    aisSocket.onclose = () => { setTimeout(connectToAis(apiKey), 10 * 1000); };
    aisSocket.onerror = () => {};
    aisSocket.onmessage = (event) => { 
        logger.debug("Received message from aisstream.io: " + event.data);
        aisMessageHandler(event.data); 
    };
};

/**
 * Sends a subscription message to aisstream.io, asking
 * them to start sending us PositionReport data.
 */
function subscribe(apiKey) {
    let subscriptionMessage = {
        Apikey: apiKey,
        BoundingBoxes: getBoundingBoxes(),
        FiltersShipMMSI: getBoatMMSIList(),
        FilterMessageTypes: ["PositionReport"]
    };
    logger.debug("Sending subscription message: " + JSON.stringify(subscriptionMessage));
    aisSocket.send(JSON.stringify(subscriptionMessage));
};

/*
 *  Message types I see from WSF ships:
 *      PositionReport
 *      ShipStaticData
 *      UnknownMessage
 *
 *    rawInfo.Message.PositionReport.NavigationalStatus   appears to be always zero
 *    rawInfo.Message.ShipStaticData.Destination          is empty or generic (e.g. 'WSF TERMINAL')
 *    rawInfo.Message.ShipStaticData.Eta                  is 0 or otherwise invalid
 */

/**
 * Receives updates from aisstream.io
 */
function aisMessageHandler(message) {
    latestActivityTime = new Date(); // Note that the connection is alive
    let aisMessage = JSON.parse(message);
    handleShipProgress(aisMessage);
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
