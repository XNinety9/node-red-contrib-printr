"use strict";

// The only file that knows Printr's routes. The nodes call these functions, so the user only
// configures the server URL and the token, and never sees a path.

const { describePrint, parseJson } = require("./ticket");

async function call(server, method, path, body) {
    let response;
    try {
        response = await fetch(`${server.url}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${server.credentials.token || ""}`,
                ...(body === undefined ? {} : { "Content-Type": "application/json" }),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (err) {
        // fetch() wraps network errors: the useful part (ECONNREFUSED…) is in err.cause.
        throw new Error((err.cause && err.cause.code) || err.message);
    }
    return { status: response.status, text: await response.text() };
}

// Routes that print: 200 printed, 202 queued or stalled, anything else is an error.
async function printing(server, method, path, body) {
    const { status, text } = await call(server, method, path, body);
    return describePrint(status, text);
}

// Other routes: 2xx is ok, the data is the JSON body.
async function plain(server, method, path, body) {
    const { status, text } = await call(server, method, path, body);
    const data = parseJson(text);
    if (status >= 200 && status < 300) {
        return { state: "ok", message: "ok", data };
    }
    return { state: "error", message: data.error || text || `HTTP ${status}`, data: null };
}

function printTicket(server, ticket) {
    return printing(server, "POST", "/print", ticket);
}

function printTodo(server, todo) {
    return printing(server, "POST", "/todo", todo);
}

function printPreset(server, id) {
    return printing(server, "POST", `/api/presets/${encodeURIComponent(id)}/print`);
}

function addShopping(server, text) {
    return plain(server, "POST", "/api/shopping", { text });
}

// A token only sees the presets that their owner shared.
function listPresets(server) {
    return plain(server, "GET", "/api/presets");
}

function status(server) {
    return plain(server, "GET", "/api/status");
}

module.exports = { printTicket, printTodo, printPreset, addShopping, listPresets, status };
