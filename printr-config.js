"use strict";

module.exports = function (RED) {
    // Configuration shared by the Printr nodes: where the printer server is, and its token.
    function PrintrConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.url = (config.url || "").replace(/\/+$/, "");
    }

    RED.nodes.registerType("printr-config", PrintrConfigNode, {
        credentials: {
            token: { type: "password" },
        },
    });
};
