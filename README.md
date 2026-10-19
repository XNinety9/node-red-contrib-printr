# node-red-contrib-printr

Node-RED nodes to print on a [Printr](https://xninety9.github.io/Printr/) receipt printer
(Epson TM-T88V). Printr runs on a Raspberry Pi and exposes a small HTTP API; these nodes call it.

## Nodes

- **printr config**: the Printr server (URL, for example `http://raspberrypi:8080`) and its token.
- **printr print**: prints `msg.payload`.
  - an object with a `blocks` array is sent as a ticket, for example
    `{ "blocks": [{ "type": "title", "text": "Alarm" }] }`;
  - a string is printed as a single text block.

The output keeps `msg.payload` and adds:

- `msg.statusCode`: the HTTP status returned by Printr;
- `msg.printr.state`: `printed`, `queued` or `stalled`. A queued ticket waits for the printer to come
  back, and a stalled one waits for the cover or the paper: neither is an error.

Errors go to the Node-RED debug panel, and the node shows the reason under its name.

## Example

[`examples/printr-tickets.json`](examples/printr-tickets.json) is a flow with a text message and a
ticket. Import it with **Menu → Import**, then set the URL and the token in its printr config node.

## Requirements

- Node-RED 3 or later, on Node.js 18 or later.
- A Printr server with a token: start it with `--token` or `PRINTR_TOKEN`.

## Installation

From the Node-RED palette (**Manage palette**), or in your Node-RED directory:

```sh
npm install node-red-contrib-printr
```

## Development

```sh
npm test
```

The tests cover the logic that turns the payload into a ticket and reads Printr's answer. They do not
need Node-RED or a printer.

## License

Apache License 2.0, like Printr.
