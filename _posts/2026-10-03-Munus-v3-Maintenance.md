---
layout: default
title: "Munus v3.0.1 - Production Maintenance Phase"
date: 2026-10-03 23:00:00 -0400
categories: [intro]
---

# [Munus v3.0.1 — Now in Production Maintenance](https://github.com/jabbott-iii/Munus/releases/tag/v3.0.1)

I am proud to announce that **Munus** has reached its production maintenance phase!

With v3.0.1, the core workflow is complete, every tracked security issue is closed, and builds, tests and releases are fully automated. From here on, the focus shifts from building new features to keeping Munus stable, secure and up to date.

It has been a little over two months since v1.0, and six releases since v2.0 (v2.1.0, v2.1.1, v2.2.0, v2.2.1, v3.0.0 and v3.0.1). Here is what came together to get here.

## What’s new since v2.0

- **Task Management**
  - Track status: to do, in progress (`doing`) or done
  - Tag tasks (for example `work`, `home`) and filter by tag
  - `munus edit` changes a task's title, description, deadline, status or tags
  - Relative deadlines such as `30m`, `2h`, `1d`, `1w`, `1M`, or combinations like `2d 3h 30m`
  - `munus list` filters: `--pending`, `--completed`, `--overdue`, `--status` and `--tag`
  - Readable deadlines in `munus list`, with labels like `(Due tomorrow)` or `(Overdue by 2 days)`

- **Data Storage & Export**
  - Tasks now live in a per-user data directory, so you see the same tasks wherever you run `munus`
  - Export schema v2 keeps status and tags; v1 files still import
  - Import from a file or standard input, merge or replace, with `--dry-run`, `--backup` and `--strict`
  - Several `munus` processes can run at once; writers wait their turn instead of failing with "database is locked"

- **Interactive TUI**
  - Edit tasks, cycle their status, and filter by status or tag
  - `?` shows every key binding
  - Optional Vim-style keybindings with `munus --vim`
  - Imports and exports run in the background, and `esc` cancels them

## Production hardening

- **Security**
  - 19 security issues tracked and closed, including owner-only file permissions, terminal escape-sequence sanitizing, and limits on input and import size
  - Fuzz testing for deadline parsing, terminal output, and import/export
  - CodeQL, gosec and govulncheck run on every change and weekly

- **Testing**
  - CI runs `go vet`, golangci-lint and the full test suite on Linux, macOS and Windows

- **Release & Supply Chain**
  - Native binaries for Linux, macOS and Windows on x86-64 and ARM64
  - Linux binaries are fully static, so they do not depend on the system's C library
  - Every release ships with `checksums.txt` and GitHub build provenance attestations
  - License files are bundled in every archive and in the Docker image
  - The Docker image runs as an unprivileged user
  - Dependabot proposes weekly dependency updates

## Upgrading from v3.0.0 or older

Earlier versions kept tasks in `munus.db` in whatever directory you ran `munus` from. v3.0.1 uses a per-user data directory instead:

| OS | Database |
|---|---|
| Linux | `~/.local/share/munus/munus.db` (or `$XDG_DATA_HOME/munus/munus.db`) |
| macOS | `~/Library/Application Support/munus/munus.db` |
| Windows | `%LOCALAPPDATA%\munus\munus.db` |

Your old file is never read or changed; Munus prints a note when it finds one. To copy your tasks into the new database, run this from the directory that holds the old file:

```bash
MUNUS_DB_PATH=./munus.db munus export --stdout | munus import --file - --id-strategy regenerate
```

Then move or delete the old `munus.db` so the note stops. To keep using the old file instead, point `MUNUS_DB_PATH` at it. The [README](https://github.com/jabbott-iii/Munus#database-location) has the full details, including PowerShell steps.

## Roadmap

Munus is now in production maintenance. Going forward:

- Bug fixes and security patches ship as patch releases
- Dependencies and the Go toolchain are kept current
- Stability comes first; new features are not the focus

Found a bug? Please [open an issue](https://github.com/jabbott-iii/Munus/issues). Contributions are welcome, see [CONTRIBUTING.md](https://github.com/jabbott-iii/Munus/blob/main/CONTRIBUTING.md).

Thank you for following along!
