# node-red-contrib-printr

Node-RED nodes for a [Printr](https://xninety9.github.io/Printr/) receipt printer
(Epson TM-T88V). Printr runs on a Raspberry Pi.

You only configure the address of your Printr and its token. Each node does one thing.

## Configuration

**printr config** holds the server URL (for example `http://raspberrypi:8080`) and the token. The
token is the `PRINTR_TOKEN` of the Printr (in `/etc/printr.env` on a Raspberry Pi).

## Nodes

| Node | Input (`msg.payload`) | Does |
| --- | --- | --- |
| **printr print** | a ticket (`{ "blocks": [...] }`) or a text | prints a ticket |
| **printr to-do** | a text (one item per line), a list, or `{ "title", "items" }` | prints a checklist with the date |
| **printr shopping** | a text (one item per line) or a list | adds items to the shopping list |
| **printr ticket** (saved) | nothing needed: the name is set in the node, or in `msg.preset` | prints a ticket saved in the Printr |
| **printr status** | nothing needed | reads the state: `printer_ready`, `queued`, `version` |

A ticket saved in the Printr is visible to the node only if its owner shared it.

Every node sends its messages on, with `msg.printr` set to:

- `state`: `printed`, `queued`, `stalled`, `ok` or `error`. A queued or stalled ticket is not an
  error: the printer gets it later.
- `message`: a short description, also shown under the node;
- `errors`: the blocks that failed, for a ticket.

The status node puts the state of the Printr in `msg.payload`.

## Example

[`examples/printr-tickets.json`](examples/printr-tickets.json) is a flow with one inject per node.
Import it with **Menu → Import**, then set the URL and the token in its printr config node.

## Requirements

- Node-RED 3 or later, on Node.js 18 or later.
- A Printr server with a token.

## Installation

From the Node-RED palette (**Manage palette**), or in your Node-RED directory:

```sh
npm install node-red-contrib-printr
```

## Development

```sh
npm test
```

The tests cover the payload conversions, the answers of Printr and the requests sent to it, against a
fake server. They do not need Node-RED or a printer.

## Releasing

1. Bump `version` in `package.json` and add its entry to [`CHANGELOG.md`](CHANGELOG.md).
2. Commit, then push a tag with the same version: `git tag v0.2.1 && git push origin v0.2.1`.

The release workflow checks that the tag matches `package.json`, runs the tests, publishes to npm
with provenance (npm trusted publishing, no token) and creates the GitHub release from the changelog.
The Node-RED flow library picks up the new npm version by itself.

## License

Apache License 2.0, like Printr.
