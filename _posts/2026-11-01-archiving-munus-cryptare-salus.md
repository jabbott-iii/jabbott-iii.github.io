---
layout: post
title: "Munus, Cryptare and Salus Archived - New Projects in Development"
date: 2026-11-01 16:00:00 -0700
categories: [intro]
kind: Update
description: "Munus, Cryptare and Salus are archived but stay public for anyone to use, fork and take over. Tidepool, hardshellDB and softshellDB are new Rust projects in development."
---

# Munus, Cryptare and Salus are archived, and three Rust projects are in development

Today I archived [Munus](https://github.com/jabbott-iii/Munus), [Cryptare](https://github.com/jabbott-iii/Cryptare) and [Salus](https://github.com/jabbott-iii/Salus), the three Go command-line tools I have been building since July. Archived does not mean gone: all three repositories stay public, so the software can still be downloaded, run and built. I am no longer working on them, and anyone who wants to carry one forward is free to fork it and take it over.

At the same time, three new Rust projects are in development: Tidepool, hardshellDB and softshellDB.

## What archiving means

- **Everything stays available.** The source code, the release downloads and the container images on GitHub Packages all stay public.
- **The repositories are read-only.** GitHub does not accept new commits, issues or pull requests on an archived repository.
- **No more updates.** There will be no new features, bug fixes or security patches from me. The production maintenance plans in my [Munus](/intro/2026/10/04/Munus-v3-Maintenance.html), [Cryptare](/intro/2026/10/31/cryptare-v1.4.0-maintenance.html) and [Salus](/intro/2026/10/31/salus-v1.2.0-maintenance.html) posts end here. Like all Apache-2.0 software, the tools are provided as-is, without warranty.

## The final releases

| Project | Final release | What it does |
|---|---|---|
| Munus | [v1.0.1](https://github.com/jabbott-iii/Munus/releases/tag/v1.0.1) | Terminal task manager with a TUI and CLI, SQLite storage, tags and relative deadlines |
| Cryptare | [v1.4.1](https://github.com/jabbott-iii/Cryptare/releases/tag/v1.4.1) | File encryption and compression with AES-256-GCM, Argon2id and a password-protected key store |
| Salus | [v1.2.1](https://github.com/jabbott-iii/Salus/releases/tag/v1.2.1) | Environment health checks for disk, memory, CPU, Docker, Kubernetes, services and certificates, with PASS/WARN/FAIL results |

These last patch releases carry small changes for Capsus and updated documentation. Cryptare v1.4.1 also builds with Go 1.26.9, which carries the Go security fix that its maintenance post said would ship in the next patch release.

A note on Munus version numbers: older posts here cover Munus v2 and v3. Go requires a module at major version 2 or higher to end its module path in `/v2`, `/v3` and so on, and Munus's path, `github.com/jabbott-iii/Munus`, has no suffix, so those tags caused Go version errors. I removed them and restarted Munus at v1.0.0. Its README calls the old releases pre-1.0.0 builds.

## Taking one over

Anyone is free to fork Munus, Cryptare or Salus and take it over. The Apache License 2.0 lets you use, change and redistribute them, commercially or not. When you redistribute them, include the `LICENSE`, keep the `NOTICE` file and the copyright notices in the source files, and mark the files you change.

A few practical notes for a fork:

- Use **Fork** on the repository's GitHub page. A fork of an archived repository is an ordinary repository, so you can push to it and publish releases. GitHub leaves Issues off in a new fork, so turn them on in its Settings if you want them.
- Change the module path in `go.mod` (for example `module github.com/jabbott-iii/Salus`) to your fork's path, and update the import paths that use it.
- If you release a v2 or later, add the matching `/v2` suffix to the module path. That is the problem that cost Munus its v2 and v3 tags.
- The CI, security and release workflows are in `.github/workflows/` and come with the fork. Review them before your first release.

[Capsus](https://github.com/jabbott-iii/Capsus), my toolbox that bundles all three tools into one `capsus` command, keeps its own copy of each as a git subtree, so archiving the repositories does not break it. [Capsus v1.0.0](/intro/2026/11/01/capsus-v1.0.0-release.html), released today, includes the final releases of all three. It is also the last Capsus release: Capsus is now archived too.

## In development

All three are Rust projects, licensed under Apache-2.0 and designed to use no third-party crates: each one writes the pieces it needs itself.

### [Tidepool](https://github.com/jabbott-iii/Tidepool)

Tidepool is an IDE and code editor. It will have a native desktop GUI in the same style as this site, a terminal UI with Vim-style modal editing, first-class Rust and Markdown support, building and signing Android and iOS apps, and AI features through plugged-in coding agents. Outside tools such as rust-analyzer, git, the Android SDK and Xcode are installed and driven by Tidepool through their official channels instead of being bundled.

Work has started. Four of the five foundation tasks in milestone M0 are done: the workspace, a core library, dependency and layering checks, and CI. So are three of the six M1 tasks for the text engine and file formats: a rope with Unicode grapheme handling; selections, transactions and an undo tree; and a JSON and JSONC codec. The roadmap runs from M0 to M14, production hardening and release.

### [hardshellDB](https://github.com/jabbott-iii/hardshellDB)

hardshellDB is an all-in-one SQL database. It is one engine with three ways in: embed it as a Rust library, use it from the `hardshell` shell, or run it as the `hardshelld` server over the PostgreSQL wire protocol, so `psql` and PostgreSQL drivers can connect. Its SQL is PostgreSQL-flavored and strictly typed. A database is a single file of checksummed pages with B+tree tables and indexes and a write-ahead log, and every transaction is serializable.

It is in the planning stage. The design, the decisions behind it and a task-by-task roadmap from M0 to M12 are written, and the storage engine and its crash tests come first, before any SQL.

### [softshellDB](https://github.com/jabbott-iii/softshellDB)

softshellDB is an all-in-one embedded NoSQL database: key-value, documents, graph, time-series, full-text search and vector search over one crash-safe storage engine. One transaction can insert a document, update its text and vector indexes, add a graph edge and record a time-series point, all atomically. A network server comes later in the roadmap.

It is in the design phase, with a roadmap from M0 to the first release at M12.

Each project's plan is in its `docs/roadmap.md` if you want to follow along.

Thank you to everyone who used Munus, Cryptare and Salus!
