import { isPrimary } from 'cluster';

if (!isPrimary) {
    // We interact with aisstream.io only on
    // the primary process
    return;
}

const aisUrl = 'wss://stream.aisstream.io/v0/stream';
import routeData from '../route_data.js';
import { getBoundingBoxes, handleShipProgress } from '../route_utilities.js';
import { aisKey } from './secrets.js';
import WebSocket from 'ws';

let aisSocket = null;

////////////////////////////////////////
//
//  Initialization

let latestActivityTime = new Date();

setInterval(checkForActivity, 60 * 1000); // Check once per minute

connectToAis();

/**
 * Opens a WebSocket with aisstream.io
 */
function connectToAis() {
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

    aisSocket = new WebSocket(aisUrl);

    //  When the socket to aisstream.io opens, subscribe for messages.
    //  When it closes, wait 10 seconds then re-connect.
    //  Ignore errors, the 'close' signal is also issued.
    aisSocket.onopen = subscribe;
    aisSocket.onclose = () => { setTimeout(connectToAis, 10 * 1000); };
    aisSocket.onerror = () => {};

    aisSocket.onmessage = (event) => { aisMessageHandler(event.data); };
}

/**
 * Sends a subscription message to aisstream.io, asking
 * them to start sending us PositionReport data.
 */
function subscribe() {

    let subscriptionMessage = {
        Apikey: aisKey,
        BoundingBoxes: getBoundingBoxes(),
        FilterMessageTypes: ["PositionReport"]
    }
    if (subscriptionMessage.Apikey[0] == '<') {
        console.log("*** Cannot subscribe to AIS data! Please enter you API key in 'src/AIS/secrets.js'");
        return;
    }
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
}

export default { connectToAis };
