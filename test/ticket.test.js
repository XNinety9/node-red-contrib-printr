"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { toTicket, toTodo, toShopping, describePrint } = require("../lib/ticket");

test("a string becomes a single text block", () => {
    assert.deepEqual(toTicket("Hello"), { blocks: [{ type: "text", text: "Hello" }] });
});

test("an object with blocks is sent as is", () => {
    const ticket = { cut: false, blocks: [{ type: "title", text: "Morning" }] };
    assert.equal(toTicket(ticket), ticket);
});

test("anything else is rejected as a ticket", () => {
    assert.throws(() => toTicket(42), TypeError);
    assert.throws(() => toTicket({ text: "no blocks here" }), TypeError);
    assert.throws(() => toTicket(undefined), TypeError);
});

test("a todo list takes a text, a list or an object", () => {
    assert.deepEqual(toTodo("milk\nbread"), { text: "milk\nbread" });
    assert.deepEqual(toTodo(["milk", 2]), { items: ["milk", "2"] });
    assert.deepEqual(toTodo({ title: "Shopping", items: ["milk"] }), { title: "Shopping", items: ["milk"] });
    assert.throws(() => toTodo({ title: "no items" }), TypeError);
});

test("shopping items are one text, one item per line", () => {
    assert.equal(toShopping("milk\nbread"), "milk\nbread");
    assert.equal(toShopping(["milk", "bread"]), "milk\nbread");
    assert.equal(toShopping({ text: "milk" }), "milk");
    assert.throws(() => toShopping(42), TypeError);
});

test("200 means printed", () => {
    assert.deepEqual(describePrint(200, '{"ok":true,"errors":[]}'), {
        state: "printed",
        message: "printed",
        errors: [],
    });
});

test("202 with queued or stalled is not an error", () => {
    assert.equal(describePrint(202, '{"ok":true,"queued":true,"errors":[]}').state, "queued");
    assert.equal(describePrint(202, '{"ok":true,"stalled":true,"errors":["paper"]}').state, "stalled");
    assert.deepEqual(describePrint(202, '{"ok":true,"stalled":true,"errors":["paper"]}').errors, ["paper"]);
});

test("errors carry the message of the JSON body", () => {
    const result = describePrint(401, '{"ok":false,"error":"unauthorized"}');
    assert.equal(result.state, "error");
    assert.equal(result.message, "unauthorized");
});

test("errors without a JSON body fall back to the raw text or the status", () => {
    assert.equal(describePrint(502, "Bad Gateway").message, "Bad Gateway");
    assert.equal(describePrint(500, "").message, "HTTP 500");
});
