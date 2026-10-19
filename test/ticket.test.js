"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { toTicket, describeResponse } = require("../lib/ticket");

test("a string becomes a single text block", () => {
    assert.deepEqual(toTicket("Hello"), { blocks: [{ type: "text", text: "Hello" }] });
});

test("an object with blocks is sent as is", () => {
    const ticket = { cut: false, blocks: [{ type: "title", text: "Morning" }] };
    assert.equal(toTicket(ticket), ticket);
});

test("anything else is rejected", () => {
    assert.throws(() => toTicket(42), TypeError);
    assert.throws(() => toTicket({ text: "no blocks here" }), TypeError);
    assert.throws(() => toTicket(undefined), TypeError);
});

test("200 means printed", () => {
    assert.deepEqual(describeResponse(200, '{"ok":true,"errors":[]}'), {
        state: "printed",
        message: "printed",
        errors: [],
    });
});

test("202 with queued or stalled is not an error", () => {
    assert.equal(describeResponse(202, '{"ok":true,"queued":true,"errors":[]}').state, "queued");
    assert.equal(describeResponse(202, '{"ok":true,"stalled":true,"errors":["paper"]}').state, "stalled");
    assert.deepEqual(describeResponse(202, '{"ok":true,"stalled":true,"errors":["paper"]}').errors, ["paper"]);
});

test("errors carry the message of the JSON body", () => {
    const result = describeResponse(401, '{"ok":false,"error":"unauthorized"}');
    assert.equal(result.state, "error");
    assert.equal(result.message, "unauthorized");
});

test("errors without a JSON body fall back to the raw text or the status", () => {
    assert.equal(describeResponse(502, "Bad Gateway").message, "Bad Gateway");
    assert.equal(describeResponse(500, "").message, "HTTP 500");
});
