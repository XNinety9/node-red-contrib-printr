"use strict";

const api = require("./lib/api");
const { toShopping } = require("./lib/ticket");
const { wire } = require("./lib/node");

module.exports = function (RED) {
    // Adds items to the shopping list of the Printr: msg.payload is a text (one item per line) or a list.
    function PrintrShoppingNode(config) {
        RED.nodes.createNode(this, config);
        wire(this, RED.nodes.getNode(config.server), (server, msg) => api.addShopping(server, toShopping(msg.payload)));
    }

    RED.nodes.registerType("printr-shopping", PrintrShoppingNode);
};
