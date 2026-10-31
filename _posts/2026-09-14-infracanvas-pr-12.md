---
layout: post
title: "Contribution: InfraCanvas #12 - LXD/Incus Terminal and Actions"
date: 2026-09-14 15:00:00 -0700
categories: [intro]
project: open-source
kind: Contribution
description: "Pull request #12 to InfraCanvas is merged: LXD and Incus containers now get the same browser terminal and start, stop and restart actions as Docker containers and Kubernetes pods."
---

# [InfraCanvas #12: LXD/Incus terminal exec and lifecycle actions](https://github.com/bytestrix/InfraCanvas/pull/12)

[InfraCanvas](https://github.com/bytestrix/InfraCanvas) draws a live map of your infrastructure (containers, pods, volumes and networks) in the browser. A small agent on each machine reports what it finds, and you get a terminal and one-click actions for what is on the canvas, with no VPN and no inbound ports.

My second open source contribution, pull request #12, was merged on September 14. It closes [issue #9](https://github.com/bytestrix/InfraCanvas/issues/9), a good first issue for adding terminal and action support to LXC/LXD/Incus containers.

## The problem

InfraCanvas already discovered LXD and Incus containers and drew them on the canvas with their name, status, memory and network. But the terminal and the start, stop and restart actions only worked for Docker containers and Kubernetes pods. Clicking an LXD container gave you information and nothing to act on, and the README listed it as a known gap.

## What I built

### An LXD executor in the agent

The new `pkg/actions/lxd.go` talks to the LXD (or Incus) REST API over its local Unix socket. It finds the socket and builds its HTTP client through the existing discovery code, so discovery and actions always agree on which daemon they are talking to.

- **Lifecycle actions:** start, stop and restart send `PUT /1.0/instances/{name}/state` with a 30-second timeout, then wait on the operation LXD returns, so the result reflects what actually happened. Stop and restart are forced, so a container that ignores the shutdown signal can't hang the action.
- **Interactive shells:** a terminal session calls `POST /1.0/instances/{name}/exec` with `interactive` and `wait-for-websocket` set, then attaches to the operation's data websocket with the secret LXD hands back.
- **Resizing:** LXD opens a second, control websocket for each session. The executor keeps it per session and sends `window-resize` messages on it, so the shell reflows when you resize the terminal panel. Closing a session closes its control channel too.
- **Reusing the existing terminal code:** the data websocket is wrapped in a `net.Conn`, so the agent's existing session handling and output coalescing treat an LXD shell exactly like a Docker one.

### Wiring it into the agent

- `ActionExecutor` creates the LXD executor at startup and routes any action with `layer: "lxd"` to it.
- `LXDExec`, `LXDExecResize` and `LXDCloseExec` give the websocket agent the same three hooks it already had for Docker.
- `handleExecStart` in `pkg/agent/ws_agent.go` gained an LXD path that reuses the existing session lifecycle instead of duplicating it.
- The frontend's action names `lxd_start_container`, `lxd_stop_container` and `lxd_restart_container` now map to backend actions.

### Runtime-aware routing in the UI

- Container actions and the terminal button now route by `node.metadata.runtime`: Docker containers keep their existing paths, and `lxd` or `incus` containers use the new ones.
- The terminal panel and websocket manager accept `lxd` as a layer.
- The Docker-only "update image" action stays scoped to Docker containers.
- Discovery exposes its LXD client and socket path so the executor can reuse them, and the README's LXD section now lists terminal and lifecycle support.

## Testing

- New unit tests cover parsing operation IDs, extracting the data and control websocket secrets from LXD's exec response, and mapping the new frontend action names.
- `make test`, `make lint` and `npm run build` pass.

## Review and merge

I opened the pull request late on September 13, and it was approved and merged the next afternoon. The maintainer built and tested it independently, and pointed out that it follows the existing Docker and Kubernetes exec pattern and comes with real test coverage.

The change came to 611 lines added and 22 removed across 13 files: Go in the agent and actions packages, and TypeScript in the canvas and terminal components.

If you run LXD or Incus, give [InfraCanvas](https://github.com/bytestrix/InfraCanvas) a try. The project welcomes contributions.
