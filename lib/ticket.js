"use strict";

// Pure helpers, kept apart from the Node-RED wiring so they can be tested without Node-RED.

/**
 * Turns `msg.payload` into a ticket for `POST /print`.
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
 * Turns `msg.payload` into a list for `POST /todo`.
 * - a string: one item per line;
 * - an array: one item per element;
 * - an object: `{ "title"?, "items"? }` or `{ "title"?, "text"? }`, sent as is.
 */
function toTodo(payload) {
    if (typeof payload === "string") {
        return { text: payload };
    }
    if (Array.isArray(payload)) {
        return { items: payload.map(String) };
    }
    if (payload && typeof payload === "object" && (Array.isArray(payload.items) || typeof payload.text === "string")) {
        return payload;
    }
    throw new TypeError('msg.payload must be a text (one item per line), a list, or { "title", "items" }');
}

/** Turns `msg.payload` into the text of a shopping list: one item per line. */
function toShopping(payload) {
    if (typeof payload === "string") {
        return payload;
    }
    if (Array.isArray(payload)) {
        return payload.map(String).join("\n");
    }
    if (payload && typeof payload === "object" && typeof payload.text === "string") {
        return payload.text;
    }
    throw new TypeError("msg.payload must be a text (one item per line) or a list");
}

/**
 * Reads the answer of a printing route (`POST /print`, `POST /todo`, `POST /api/presets/{id}/print`).
 * Returns `{ state, message, errors }`, where state is "printed", "queued", "stalled" or "error".
 * Queued and stalled tickets are not failures: the printer will get them later.
 */
function describePrint(status, text) {
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

module.exports = { toTicket, toTodo, toShopping, describePrint, parseJson };
