"use strict";

const { toTicket, describeResponse } = require("./lib/ticket");

module.exports = function (RED) {
    // Prints msg.payload (a ticket object, or a string) with POST /print.
    function PrintrPrintNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const server = RED.nodes.getNode(config.server);

        node.on("input", async function (msg, send, done) {
            // Node-RED 1.0 and later pass send and done; keep the fallbacks for older versions.
            send = send || ((...args) => node.send(...args));
            done = done || ((err) => { if (err) node.error(err, msg); });

            if (!server) {
                node.status({ fill: "red", shape: "ring", text: "no server" });
                return done(new Error("No Printr server configured"));
            }

            try {
                const ticket = toTicket(msg.payload);
                const response = await fetch(`${server.url}/print`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${server.credentials.token || ""}`,
                    },
                    body: JSON.stringify(ticket),
                });
                const result = describeResponse(response.status, await response.text());

                msg.statusCode = response.status;
                msg.printr = result;

                if (result.state === "error") {
                    node.status({ fill: "red", shape: "ring", text: result.message });
                    return done(new Error(`Printr: ${result.message}`));
                }
                const fill = result.state === "printed" ? "green" : "yellow";
                node.status({ fill, shape: "dot", text: result.message });
                send(msg);
                done();
            } catch (err) {
                // fetch() wraps network errors: the useful part (ECONNREFUSED…) is in err.cause.
                const reason = (err.cause && err.cause.code) || err.message;
                node.status({ fill: "red", shape: "ring", text: reason });
                done(new Error(`Printr: ${reason}`));
            }
        });
    }

    RED.nodes.registerType("printr-print", PrintrPrintNode);
};
