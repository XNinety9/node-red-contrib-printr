"use strict";

const api = require("./lib/api");
const { wire } = require("./lib/node");

module.exports = function (RED) {
    // Reads the state of the Printr. msg.payload becomes the status: printer_ready, queued, version…
    function PrintrStatusNode(config) {
        RED.nodes.createNode(this, config);

        wire(this, RED.nodes.getNode(config.server), async (server, msg) => {
            const result = await api.status(server);
            if (result.state === "ok") {
                msg.payload = result.data;
                result.message = result.data.printer_ready
                    ? `ready, ${result.data.queued} queued`
                    : `not ready, ${result.data.queued} queued`;
            }
            return result;
        });
    }

    RED.nodes.registerType("printr-status", PrintrStatusNode);
};
