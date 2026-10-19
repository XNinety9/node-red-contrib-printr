"use strict";

const api = require("./lib/api");
const { toTicket } = require("./lib/ticket");
const { wire } = require("./lib/node");

module.exports = function (RED) {
    // Prints msg.payload: a ticket object, or a text.
    function PrintrPrintNode(config) {
        RED.nodes.createNode(this, config);
        wire(this, RED.nodes.getNode(config.server), (server, msg) => api.printTicket(server, toTicket(msg.payload)));
    }

    RED.nodes.registerType("printr-print", PrintrPrintNode);
};
