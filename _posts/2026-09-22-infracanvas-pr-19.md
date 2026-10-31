---
layout: post
title: "Contribution: InfraCanvas #19 - Explicit Local Kubeconfig Discovery"
date: 2026-09-22 08:00:00 -0700
categories: [intro]
project: open-source
kind: Contribution
description: "Pull request #19 to InfraCanvas is merged: local kubeconfig auto-discovery is now reported in every snapshot, announced in the UI and can be turned off with a flag or environment variable."
---

# [InfraCanvas #19: explicit, countable and opt-out local kubeconfig discovery](https://github.com/bytestrix/InfraCanvas/pull/19)

My second pull request to [InfraCanvas](https://github.com/bytestrix/InfraCanvas), the live Docker and Kubernetes infrastructure map, was merged on September 21. It closes [issue #15](https://github.com/bytestrix/InfraCanvas/issues/15) and makes one of the agent's quieter behaviors visible and controllable.

## The problem

When the host agent started, it loaded `~/.kube/config` (or `$KUBECONFIG`) and connected to the contexts it found, without telling you. That is different from the explicit **Clusters → Connect cluster** flow, where you upload a kubeconfig and pick a context yourself.

On a developer machine with leftover contexts from other work, such as `kind`, `minikube` or an old project's cluster, a first run of `infracanvas serve` could fill the sidebar with clusters you never chose to connect. There was no notice that it had happened, no record of which contexts were picked up, and no way to turn it off.

## What I built

### One resolver for kubeconfig loading

The new `ResolveKubeConfig` in `pkg/discovery/kubernetes/resolver.go` is now the single place where the agent decides how to reach Kubernetes:

1. It tries the in-cluster config first, for an agent running inside a cluster.
2. Only if local discovery is enabled, it loads the local kubeconfig: every file in the `KUBECONFIG` path list, or `~/.kube/config`.
3. It counts the contexts from the parsed kubeconfig itself, without making any calls to a cluster.

Kubernetes discovery and the Kubernetes action executor each had their own copy of this logic before. Both now call the resolver, which removed the duplicate code and means the opt-out below can't be bypassed through one of them.

### An opt-out flag and environment variable

- `infracanvas serve` and `infracanvas start` gained `--discover-local-kubeconfig`, which defaults to `true` so nothing changes for existing users.
- `INFRACANVAS_DISCOVER_LOCAL_KUBECONFIG` overrides the flag.
- Clusters connected by uploading a kubeconfig in the UI are unaffected, and so is Docker discovery.

```bash
# Skip local kubeconfig auto-discovery
infracanvas serve --discover-local-kubeconfig=false

# Or set it in the environment
INFRACANVAS_DISCOVER_LOCAL_KUBECONFIG=false infracanvas serve
```

### A discovery report in every snapshot

Every snapshot and graph payload now carries a `localKubeconfigAutoDiscovery` object, so the UI and API clients can see exactly what happened:

| Field | Meaning |
|---|---|
| `enabled` | Whether local kubeconfig auto-discovery is allowed |
| `ran` | Whether the local discovery logic actually ran |
| `discoveredContexts` | How many contexts were parsed from local kubeconfig files |
| `connectedContexts` | How many of them produced a connected Kubernetes discovery |

The object is always present, even when discovery is disabled, so a client can always read it.

### A one-time notice in the UI

On first load, the dashboard shows a dismissible notice when local contexts were discovered and connected. It only appears for the local host session, and only when discovery ran and found and connected at least one context. Dismissing it is remembered in `localStorage`, so it doesn't come back on refresh or reconnect. There is no notice when discovery is disabled, when only in-cluster config was used, when no contexts were found, or for clusters you uploaded yourself.

### Documentation

The README and `SECURITY.md` now describe the auto-discovery behavior, the opt-out flag and environment variable, with examples. The help text for `serve` and `start` lists the new environment variable.

## Testing

- New resolver tests cover disabled discovery, counting the contexts in a kubeconfig, and merging contexts across a `KUBECONFIG` path list of several files.
- A new formatter test checks that the discovery report is included in the graph payload.
- `make test`, `make lint` and `npm run build` pass.

## Review and merge

The pull request was approved and merged on September 21. It came to 528 lines added and 214 removed across 17 files, touching the CLI commands, the Kubernetes discovery and action packages, the orchestrator, the snapshot model and the dashboard.

Connecting to a cluster is a big step, and after this change InfraCanvas tells you when it took that step on its own and lets you turn it off.
