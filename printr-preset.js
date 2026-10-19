"use strict";

const api = require("./lib/api");
const { wire } = require("./lib/node");

module.exports = function (RED) {
    // Prints a ticket saved in Printr, by its name or its id. msg.preset overrides the node's field.
    function PrintrPresetNode(config) {
        RED.nodes.createNode(this, config);

        wire(this, RED.nodes.getNode(config.server), async (server, msg) => {
            const wanted = String(msg.preset || config.preset || "").trim();
            if (!wanted) {
                throw new Error("No preset: set one in the node or in msg.preset");
            }
            const list = await api.listPresets(server);
            if (list.state === "error") {
                return list;
            }
            const preset = list.data.find((p) => p.id === wanted)
                || list.data.find((p) => p.name.toLowerCase() === wanted.toLowerCase());
            if (!preset) {
                throw new Error(`No shared ticket named "${wanted}"`);
            }
            return api.printPreset(server, preset.id);
        });
    }

    RED.nodes.registerType("printr-preset", PrintrPresetNode);
};
