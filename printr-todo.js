"use strict";

const api = require("./lib/api");
const { toTodo } = require("./lib/ticket");
const { wire } = require("./lib/node");

module.exports = function (RED) {
    // Prints a checklist with the date: msg.payload is a text (one item per line), a list, or { title, items }.
    function PrintrTodoNode(config) {
        RED.nodes.createNode(this, config);
        wire(this, RED.nodes.getNode(config.server), (server, msg) => api.printTodo(server, toTodo(msg.payload)));
    }

    RED.nodes.registerType("printr-todo", PrintrTodoNode);
};
