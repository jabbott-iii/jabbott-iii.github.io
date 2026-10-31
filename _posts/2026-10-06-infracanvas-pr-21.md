---
layout: post
title: "Contribution: InfraCanvas #21 - Machines and Clusters Pages"
date: 2026-10-06 09:00:00 -0700
categories: [intro]
project: open-source
kind: Contribution
description: "Pull request #21 to InfraCanvas is merged: the open source dashboard gets Machines and Clusters pages with status cards, a capped sidebar, a sidebar overflow fix and a build with zero lint warnings."
---

# [InfraCanvas #21: Machines and Clusters pages, and a clean frontend build](https://github.com/bytestrix/InfraCanvas/pull/21)

My third pull request to [InfraCanvas](https://github.com/bytestrix/InfraCanvas), the live Docker and Kubernetes infrastructure map, was merged on October 5. It closes two issues in the Next.js dashboard: [#16](https://github.com/bytestrix/InfraCanvas/issues/16), which asked for dedicated Machines and Clusters pages, and [#18](https://github.com/bytestrix/InfraCanvas/issues/18), which asked to clear the React hook lint warnings printed on every build.

<img width="1280" height="820" alt="The new Machines page in InfraCanvas, dark theme" src="https://github.com/user-attachments/assets/7a4738f9-8e28-4b70-a3d5-5923dc8f90eb" />

## The problem

InfraCanvas's hosted dashboard has full Machines and Clusters pages with cards, status and a connect flow. The open source dashboard only had collapsible lists in the sidebar, showing a name and a status dot for each entry. That works for one machine and a cluster or two, but it gets cramped quickly once you connect a handful of machines or several kubeconfigs.

Separately, `npm run build` printed six `react-hooks/exhaustive-deps` and `no-img-element` warnings on every build. None of them broke the build, but they buried any new warning in noise.

## Machines and Clusters pages (#16)

- **Sidebar entries with counts.** Machines and Clusters each get a sidebar item with a count. Each opens a card grid as an in-page view, the same way the Audit view works, so there are no new routes and no Go changes.
- **Machine cards** show online state, when the machine joined or was last seen, how many resources it reports, and its scope.
- **Cluster cards** also show the context, API server and when the cluster was added, all from the existing `GET /api/clusters` endpoint. Clusters added from a kubeconfig get a read-only toggle and a two-click Disconnect, so one stray click can't remove a cluster.
- **A capped sidebar.** The sidebar lists show at most five entries, with a "View all (N)" link to the full page. The entry you are viewing always stays visible, even when it falls outside the first five.
- **Small data additions.** `SessionInfo` gained the `pairedAt` and `lastSeen` fields that `/api/sessions` already sent, and the stylesheet gained `--healthy`, `--degraded` and `--unhealthy` color tokens for the status badges.

### A sidebar bug fixed on the way

A long hostname or context name stretched the sidebar past its 200px column. That pushed the read-only/read-write and remove controls out of view, and on mobile the closed navigation drawer covered the menu button. The sidebar is now pinned to its column (`flex: 1` with `min-width: 0`), so a long name no longer pushes the controls out of view.

<img width="1280" height="820" alt="The new Clusters page in InfraCanvas, dark theme" src="https://github.com/user-attachments/assets/347dea6c-73c9-4cdd-acbd-bf6096800650" />

## A build with zero lint warnings (#18)

Each warning got the smallest fix that kept the component's behavior the same:

- **`AgentOverview`:** `hostMeta` fell back to a new `{}` on every render, which made a `useMemo` that depended on it recompute every time. It is now memoized, so the fallback keeps one identity.
- **`LogsPanel`:** `targetNode` was added to the effect's dependencies. It doesn't cause extra runs, because `fetchLogs` already changes whenever `targetNode` does.
- **`InfraCanvas`:** the stable `setNodes` and `setEdges` setters were added to the dependencies. `spotlightKey` stays out of the layout effect on purpose, with a commented suppression: re-running the layout when you toggle the spotlight would reset any nodes you had dragged into place.
- **`Logo`:** the plain `<img>` stays, with a commented suppression. The dashboard is a static export with `images.unoptimized`, so `next/image` would add nothing.

## Testing

- `next lint` reports 0 warnings, down from 6, and `tsc --noEmit` and `npm run build` pass.
- I tested the pages with Playwright against a mock API with seven machines and seven clusters: the read-only toggle, Disconnect, opening a card into the Overview, the sidebar cap, both light and dark themes, and a 390px-wide mobile screen with no horizontal scrolling.
- The change has no Go code, so the Go test suite wasn't affected. It wasn't tested against a live hub with real agents.

## Review and merge

The pull request was approved and merged on October 5. It came to 478 lines added and 16 removed across 11 files, including three new components in `frontend/components/fleet/`: `MachinesView`, `ClustersView` and the cards they share.

This was my third merged pull request to InfraCanvas, after [#12](/intro/2026/09/14/infracanvas-pr-12.html) and [#19](/intro/2026/09/22/infracanvas-pr-19.html).
