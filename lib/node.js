"use strict";

// Wires a node's input to a Printr action. The action receives the server and the message,
// and returns `{ state, message, ... }`, which the node puts in msg.printr and shows as its status.

const COLORS = { printed: "green", ok: "green", queued: "yellow", stalled: "yellow", error: "red" };

function wire(node, server, action) {
    node.on("input", async function (msg, send, done) {
        // Node-RED 1.0 and later pass send and done; keep the fallbacks for older versions.
        send = send || ((...args) => node.send(...args));
        done = done || ((err) => { if (err) node.error(err, msg); });

        try {
            if (!server) {
                throw new Error("No Printr server configured");
            }
            const result = await action(server, msg);
            msg.printr = result;
            node.status({
                fill: COLORS[result.state] || "red",
                shape: result.state === "error" ? "ring" : "dot",
                text: result.message,
            });
            if (result.state === "error") {
                return done(new Error(`Printr: ${result.message}`));
            }
            send(msg);
            done();
        } catch (err) {
            node.status({ fill: "red", shape: "ring", text: err.message });
            done(new Error(`Printr: ${err.message}`));
        }
    });
}

module.exports = { wire };
