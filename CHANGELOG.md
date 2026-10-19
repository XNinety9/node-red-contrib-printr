# Changelog

## [0.2.1] - 2026-10-19

### Changed

- Releases are published to npm by GitHub Actions, with provenance, when a `v*` tag is pushed.

### Added

- Continuous integration: the tests run on Node.js 18, 20, 22 and 24 for every push and pull request.

## [0.2.0] - 2026-10-19

### Added

- **printr to-do**: prints a checklist with the date.
- **printr shopping**: adds items to the shopping list of the Printr.
- **printr ticket**: prints a ticket saved in the Printr, by its name or its id (shared tickets only).
- **printr status**: reads the state of the Printr (`printer_ready`, `queued`, `version`).
- The example flow uses every node.

### Changed

- Each node does one action: only the server URL and the token are configured, never a route.
- `msg.printr` (`state`, `message`, `errors`) replaces `msg.statusCode`.

## [0.1.2] - 2026-10-19

### Fixed

- Installing the package no longer pulls Node-RED and its dependencies: the `node-red` peer
  dependency is gone.

## [0.1.1] - 2026-10-19

### Added

- An example flow, and the minimum Node-RED version (3.0.0) in `package.json`.

## [0.1.0] - 2026-10-19

### Added

- First version: **printr config** (URL and token) and **printr print**.
