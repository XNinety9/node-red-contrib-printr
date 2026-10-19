"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const api = require("../lib/api");

// A fake Printr: records each request and answers from the routes table.
function fakePrintr(routes) {
    const seen = [];
    const server = http.createServer((req, res) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            seen.push({ method: req.method, path: req.url, auth: req.headers.authorization, body });
            const route = routes[`${req.method} ${req.url}`] || { status: 404, body: { ok: false, error: "route inconnue" } };
            res.writeHead(route.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(route.body));
        });
    });
    return new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address();
            resolve({ seen, server, config: { url: `http://127.0.0.1:${port}`, credentials: { token: "secret-token" } } });
        });
    });
}

test("printing actions call the printing routes with the token", async () => {
    const fake = await fakePrintr({
        "POST /print": { status: 200, body: { ok: true, errors: [] } },
        "POST /todo": { status: 202, body: { ok: true, queued: true, errors: [] } },
    });
    try {
        const ticket = { blocks: [{ type: "text", text: "hi" }] };
        assert.equal((await api.printTicket(fake.config, ticket)).state, "printed");
        assert.equal((await api.printTodo(fake.config, { text: "milk" })).state, "queued");
        assert.deepEqual(JSON.parse(fake.seen[0].body), ticket);
        assert.equal(fake.seen[0].auth, "Bearer secret-token");
    } finally {
        fake.server.close();
    }
});

test("a preset is printed by its id", async () => {
    const fake = await fakePrintr({ "POST /api/presets/abc123/print": { status: 200, body: { ok: true } } });
    try {
        assert.equal((await api.printPreset(fake.config, "abc123")).state, "printed");
        assert.equal(fake.seen[0].method, "POST");
    } finally {
        fake.server.close();
    }
});

test("shopping, presets and status return their data", async () => {
    const fake = await fakePrintr({
        "POST /api/shopping": { status: 200, body: [{ text: "milk" }] },
        "GET /api/presets": { status: 200, body: [{ id: "abc123", name: "Morning" }] },
        "GET /api/status": { status: 200, body: { printer_ready: true, queued: 0 } },
    });
    try {
        const shopping = await api.addShopping(fake.config, "milk");
        assert.equal(shopping.state, "ok");
        assert.equal(JSON.parse(fake.seen[0].body).text, "milk");
        assert.equal((await api.listPresets(fake.config)).data[0].name, "Morning");
        assert.equal((await api.status(fake.config)).data.printer_ready, true);
    } finally {
        fake.server.close();
    }
});

test("a refused token is reported as an error with the message of Printr", async () => {
    const fake = await fakePrintr({ "GET /api/status": { status: 401, body: { ok: false, error: "connexion requise" } } });
    try {
        const result = await api.status(fake.config);
        assert.equal(result.state, "error");
        assert.equal(result.message, "connexion requise");
    } finally {
        fake.server.close();
    }
});

test("an unreachable server throws with the network reason", async () => {
    // Grab a free port, then close it: nothing listens there any more.
    const probe = http.createServer().listen(0, "127.0.0.1");
    await new Promise((resolve) => probe.on("listening", resolve));
    const { port } = probe.address();
    await new Promise((resolve) => probe.close(resolve));

    const config = { url: `http://127.0.0.1:${port}`, credentials: { token: "x" } };
    await assert.rejects(api.status(config), /ECONNREFUSED/);
});
