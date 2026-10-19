"use strict";

// Pure helpers, kept apart from the Node-RED wiring so they can be tested without Node-RED.

/**
 * Turns `msg.payload` into a Printr ticket.
 * - an object with a `blocks` array is a ticket, sent as is;
 * - a string becomes a single text block.
 */
function toTicket(payload) {
    if (typeof payload === "string") {
        return { blocks: [{ type: "text", text: payload }] };
    }
    if (payload && typeof payload === "object" && Array.isArray(payload.blocks)) {
        return payload;
    }
    throw new TypeError('msg.payload must be a ticket ({ "blocks": [...] }) or a string');
}

/**
 * Reads the answer of `POST /print`.
 * Returns `{ state, message, errors }`, where state is "printed", "queued", "stalled" or "error".
 * Queued and stalled tickets are not failures: the printer will get them later.
 */
function describeResponse(status, text) {
    const body = parseJson(text);
    if (status === 200) {
        return { state: "printed", message: "printed", errors: [] };
    }
    if (status === 202 && body.queued) {
        return { state: "queued", message: "queued", errors: body.errors || [] };
    }
    if (status === 202 && body.stalled) {
        return { state: "stalled", message: "stalled (cover or paper?)", errors: body.errors || [] };
    }
    const message = body.error || text || `HTTP ${status}`;
    return { state: "error", message, errors: [] };
}

function parseJson(text) {
    try {
        const value = JSON.parse(text);
        return value && typeof value === "object" ? value : {};
    } catch {
        return {};
    }
}

module.exports = { toTicket, describeResponse };
