---
layout: post
title: "Nadir Deep Dive - Architecture of a Zero-Dependency 2D Engine"
date: 2026-11-07 16:00:00 -0700
categories: [intro]
project: nadir
kind: Deep Dive
description: "How Nadir, my Rust engine for top-down 2D games, is built with no third-party crates: seven enforced layers, its own OS bindings, renderer, ECS, codecs and tools."
---

# [Inside Nadir: a 2D engine built from the operating system up](https://github.com/jabbott-iii/Nadir)

[Nadir](https://github.com/jabbott-iii/Nadir) is my 2D game engine for top-down games: tilemaps, y-sorted sprites, kinematic movement and many entities. It is written in Rust for Windows, macOS and Linux, and it uses **no third-party crates**. The OS bindings, the OpenGL backend, the math, the ECS, the image and data codecs, the asset pipeline and every test harness are in the repository.

This post walks through how it is put together, from the bottom of the stack to the release pipeline, and what it is all for. Everything here describes the main branch at commit `fffefb4` (November 7). That is a few tasks ahead of the 0.2.0 release of November 2: level loading in the game, the pack file and the hot-reload pieces landed after it. I have tried to be clear about what works today and what is still planned.

<img width="960" height="540" alt="Nadir's sandbox: a pixel-art character walking down a dirt path through a grass field, past a rock, between stone walls" src="https://jabbott.dev/Nadir/media/field.png" />

*The sandbox's field scene, drawn by the engine in CI. The [demo page](https://jabbott.dev/Nadir/) plays it and two stress scenes as video.*

## The end product

Nadir is not a general-purpose engine. Its overview sets one goal above the rest: **ship a commercial-quality top-down game on Windows, macOS and Linux.** It is built alongside one real game, `games/sandbox`, which is meant to become that shipping title, and the rule is that the game pulls features in and the engine never pushes them. A subsystem is not done until the sandbox uses it.

The other goals follow from that one: own the whole stack above the OS and GPU driver so any bug can be understood and fixed in-house, keep the engine small enough for one or two people to hold in their heads, and iterate fast with hot reload in development builds.

The non-goals matter just as much:

- **No web, mobile or consoles** (ADR-0001). Desktop only means a plain polling main loop, std threads with no async runtime, and no surface-loss handling.
- **No 3D or skeletal animation, and no rigid-body physics.** Collision is kinematic (ADR-0011).
- **No editor.** Levels are made in [LDtk](https://ldtk.io) and sprites in Aseprite or any PNG tool (ADR-0012).
- **No networking and no scripting language.** Gameplay is Rust plus data files.

The performance budgets are written down. The stress scenes, benchmarks and an allocation test already measure the sprite, simulation and allocation budgets, and a pass on a min-spec machine before release (M11.5) is to measure every one of them:

| Budget | Target on min-spec |
|---|---|
| Frame rate | 60 fps at 1920×1080 on an integrated GPU of about 2018 (e.g. Intel UHD 620), OpenGL 3.3 core |
| Sprites | 10,000 at 60 fps in at most 30 draw calls |
| Simulation | 5,000 entities with collision at 60 Hz in at most 4 ms a tick |
| Frame spikes | 99th-percentile frame at most 20 ms |
| Level load | at most 500 ms for a 256×256-tile level |
| Allocations | 0 heap allocations per frame in rendering, ECS iteration, audio and collision |
| Binary | at most 15 MB per platform |

No min-spec machine has been named yet, so every number in this post comes from my development machine or the CI runner, not from min-spec.

### What ships today

Version 0.2.0 is public through four channels:

- **GitHub releases** for Linux, Windows and macOS on x86-64 and ARM64, each with `nadir-cook` (the asset pipeline) and the sandbox game
- **A signed apt repository** with `nadir-cook` and `nadir-sandbox` packages for amd64 and arm64
- **A container image** of the cook, `ghcr.io/jabbott-iii/nadir-cook`, for amd64 and arm64
- **13 crates on crates.io.** A game adds `nadir_engine` (the name `nadir` was taken) and writes `use nadir::prelude::*`

A game needs only the facade crate:

```rust
use nadir::prelude::*;

fn main() -> Result<(), nadir::Error> {
    App::new(Config::default())
        .add_fixed_system(FixedStage::Gameplay, "hello", |_, tick| {
            if tick.index == 0 {
                nadir::log::info!("the first tick");
            }
        })
        .run()
}
```

On Linux (X11, or Wayland through XWayland) the engine draws: a window with keyboard and mouse input and an OpenGL 3.3 renderer with y-sorted instanced sprites, tilemaps, animation and a pixel-perfect camera. The fixed 60 Hz simulation, the ECS, collision, deterministic replays, worker-thread asset loading and the offline cook are not tied to drawing and run on all three systems. On Windows and macOS everything builds and passes the tests, and the window and event code is written, but the window stays empty until their OpenGL contexts land (roadmap tasks M2.6 and M2.7). Audio, text, the debug tools, gamepads, saves, hot reload in the running game and the Metal backend are not built yet.

## Rule zero: build it ourselves

The root decision, ADR-0002, is zero third-party crates. It rejected winit, wgpu, bevy_ecs, kira, egui and serde, and it is enforced, not just stated:

- **`Cargo.lock` holds exactly the 18 workspace packages.** `cargo xtask deps` fails CI if any registry or git package appears in the package graph that `cargo metadata` resolves for the workspace, because its allowlist is empty.
- **Even the checks are home-made.** xtask reads `cargo metadata` with Nadir's own JSON parser, compares golden images with its own QOI decoder and fuzzes with its own mutation fuzzer.
- **The design bends first.** Before a crate is even considered, the design is changed to remove the need: QOA instead of Vorbis for audio, bitmap fonts instead of TrueType, and PNG decoding only in the offline cook. The dependency policy's build-versus-buy register lists 34 capabilities, and every one is "Build" except coverage-guided fuzzing, which is still a proposal.

What does not count as a dependency is the operating system itself. On Linux, `libX11`, `libEGL` and OpenGL are loaded at run time with `dlopen`, so no development packages are needed to build and a missing library produces a clear error instead of a loader failure.

## Seven layers, checked by CI

The workspace is 18 members in seven layers. Each crate may depend only on crates in the layers below it, and only on the ones its row of the dependency matrix allows:

| Layer | Crates | Role |
|---|---|---|
| 0 | `core`, `sys` | Math, time, logging, RNG and hashing; raw OS and GL declarations |
| 1 | `platform`, `codec` | Safe windows, events and GL contexts; the asset file formats, from PNG to the pack file |
| 2 | `gfx`, `ecs`, `assets`, `input`, `collision` | The GPU interface, the ECS, the asset server, actions, collision |
| 3 | `render`, `audio`, `scene` | The 2D renderer, audio (empty so far), reflection, prefabs and levels |
| 4 | `debug` | Developer tools (empty so far) |
| 5 | `nadir_engine` | The facade a game uses |
| 6 | `sandbox`, `cook`, `xtask`, `bench` | The game, the asset pipeline, CI tooling, benchmarks |

`cargo xtask layers` checks every declared dependency, normal, dev and build, against a constant matrix in the code, and a unit test parses the same table out of `docs/01-architecture.md` and asserts that the two are equal, so the documentation cannot drift from what CI enforces.

A second rule shapes the middle of the stack (ADR-0014): **subsystems know nothing about the ECS.** `render`, `collision`, `input` and `assets` expose plain APIs and are tested on their own. Only the facade defines components and the glue systems that connect them, so swapping the ECS would touch only the facade and `scene`.

## `unsafe` lives in three crates

The workspace sets `unsafe_code = "deny"`. Only `sys`, `platform` and `gfx` turn it back on, at their crate roots. Clippy additionally denies undocumented unsafe blocks and blocks with more than one unsafe operation, and `cargo xtask unsafe-audit` scans the source text itself, including `cfg` branches the compiler skips on the current OS. It fails on `unsafe` outside those three crates, on any unsafe block without a `SAFETY:` comment just above it, and on any attempt to re-enable `unsafe_code` anywhere else.

## The bottom of the stack: sys, platform and gfx

**`nadir-sys`** is declarations only: hand-written FFI types, constants and function tables, each citing the C header it comes from, with compile-time layout assertions. How it reaches each OS differs:

- **Linux:** Xlib and EGL are never linked. A `dynlib!` macro turns a declaration list into a struct of function pointers, filled with `dlsym`, and a missing symbol becomes one error that names every absent function.
- **Windows:** Win32 is linked through the SDK's import libraries.
- **macOS:** every Objective-C call goes through a `msg_send!` macro that casts `objc_msgSend` to the exact signature of that call, because a variadic call is undefined behaviour on arm64, and uses the `_stret` variant on x86-64 for results over 16 bytes.
- **OpenGL** is never linked anywhere. Its 60 functions are loaded per context.

**`nadir-platform`** wraps those declarations in one safe API: `Platform`, `Event` and `GlContext`. On Linux it opens an X11 window with an sRGB EGL surface and an OpenGL 3.3 core context, plus a surfaceless headless context for tests. On Windows and macOS the window and event loops exist, including a modal-frame callback that keeps the game going while the system runs its own loop during a drag or resize (driven by a timer on Windows and by each resize step on macOS). With no GL context yet, though, the game runs undrawn there (ADR-0019).

**`nadir-gfx`** is a small, checked rendering interface over OpenGL 3.3 core, shaped from the start around Metal's model of baked pipeline state so the planned Metal backend will not reshape the API (ADR-0004). Three decisions make it safe to call from safe code:

- **Contexts are an unsafe contract** (ADR-0015). `GlContext` is an `unsafe trait`, so only the three crates that allow unsafe code can promise "these are real GL functions, and a 3.3 core context is current on this thread".
- **Every call checks the context is alive** (ADR-0016). The device holds an ID instead of a borrow, and each GL call first builds a token that checks the context is still current (about 1.5 ns), failing closed with `ContextLost`.
- **Every draw is bounds-checked on the CPU.** Before a draw is issued, every vertex, instance and index it will read is checked against its buffer, using a shadow copy of each index buffer. Only the two draw calls themselves remain `unsafe`.

Shaders follow the same thinking: every GLSL source must begin with exactly `#version 330 core`, and a preprocessor-faithful scan refuses any `#extension`, because an extension could hand shaders resources that no CPU-side check covers.

## One frame, one thread

One main thread owns the window, the GL context, the ECS world and rendering. Asset workers, `clamp(cores − 2, 1, 4)` of them, only read and decode files.

Time is handled by `FixedClock`, which counts in units of nanoseconds times the tick rate. At 60 Hz one tick is exactly 1,000,000,000 units, so there is nothing to round and the clock never drifts. It never reads the system clock itself, so a headless run or a replay fed the same frame lengths gets identical ticks. A frame is counted for at most 250 ms, so a hitch cannot trigger a spiral of catch-up ticks.

A frame then runs like this:

1. **Events:** the window's events are pumped without blocking and fed to the input system.
2. **Ticks:** for each 60 Hz tick due, input is latched into an `ActionState` (or the next tick of a replay is swapped in), the five fixed stages run (Input, Gameplay, Movement, PostMovement, Cleanup), and queued structural changes are applied.
3. **Frame stages:** Animate, Camera, Ui and Extract run once. Extract interpolates every sprite between its previous and current transform by how far the frame lies between ticks.
4. **Draw:** the scene is drawn into a virtual-resolution image, scaled up into the window and swapped.
5. **Asset finish:** decoded assets are uploaded to the GPU on the main thread, within a 2 ms budget.
6. **Pacing:** the frame limiter sleeps until 1 ms before the next frame is due, then spins.

## The ECS: simple, ordered, deterministic

Nadir's ECS (ADR-0006) puts determinism and simplicity ahead of parallel throughput:

- **Sparse sets, no archetypes.** Each component type is stored in its own sparse set behind a `RefCell`, with no `unsafe`. Entities are generational indices. Multi-component iteration walks one set and looks the others up by entity.
- **Systems are plain function pointers** in five fixed stages and four frame stages. They run in stage order, then in the order they were added, with no parallelism. A borrow conflict is a run-time panic, not a compile error.
- **Structural changes are deferred.** Spawning, inserting and despawning go through `Commands`, applied after each tick and each frame through a single operation list that keeps its capacity, so steady churn allocates nothing.
- **The engine's own systems run first in their stages.** The facade adds seven: the transform snapshot for interpolation, movement, parent offsets, triggers, animation and the sprite and level extraction. Each is added before any of the game's, so a game sets velocities in Gameplay and reacts to the moves after the engine's own systems in Movement or PostMovement.
- **Reflection without proc macros** (ADR-0007). Most components are declared inside `macro_rules!` macros (`reflect_struct!`, `reflect_enum!`, `reflect_newtype!`), since proc macros would need syn and quote. The few the macros cannot express, such as `Sprite`, `Collider` and `Animator`, implement `Reflect` by hand. Either way, one reflection path feeds prefabs, levels and the determinism hash.

The decision record names its own revisit point: if the ECS ever takes more than a quarter of a tick, the design gets reconsidered.

## Collision without physics

Collision is kinematic only (ADR-0011): boxes and circles, a tile grid, 32 collision layers, a spatial hash and `move_and_slide`. Each tick the spatial hash is rebuilt from scratch. Each mover sweeps the X axis and then Y, in up to 16 substeps, against the solid tiles and the colliders gathered near its whole move, and it can slide out of an overlap but never go deeper into one. Each result is written back immediately, so movers later in the tick see where the earlier ones went. Triggers are sorted pairs of IDs compared with the previous tick's pairs, which gives enter and exit events.

The 5,000-entity benchmark and stress scene drove the one big optimisation so far (ADR-0026). Each sweep now takes its contacts from the pass that finds where it stops, instead of searching a second time; each move gathers its nearby solids once, instead of querying the hash on every sweep; and each hash entry carries its own bounds. Together they cut the 5,000-entity benchmark tick from about 6.3 ms to 2.4 ms on my i7-11800H. That is under the 4 ms budget, though the budget is for a min-spec machine that has not been named yet.

## Determinism you can test

Determinism is not a hope here; it has a test (ADR-0025). A replay records each tick's actions (three flag bits per action plus 16-bit axis values), and the world hash is FNV-1a over every reflected component in storage order. The determinism test runs its own game of 200 walkers for 600 ticks and compares every tick's hash with one committed `hashes.txt`, at several frame pacings, and the same file holds on Linux, Windows and macOS.

That only works under rules the project writes down: no `sin`, `cos` or other transcendental functions in tick systems, no iterating hash maps, and animation that runs in frame stages on the simulation clock, with the sprite fields it writes left out of the hash. The cost is accepted: fixed systems that read the mouse pointer or the wheel do not replay yet.

## Rendering: sort keys and whole pixels

`nadir-render` knows nothing about entities. Each frame the facade fills a reused `RenderFrame` (camera, clear colour, sprites, tile layers and time), and the renderer turns it into draw calls:

- **One 64-bit sort key per sprite:** 8 bits of layer, 32 bits of depth (the sortable bit pattern of the sprite's feet, for y-sorting), 16 bits of texture and 8 of sequence. Ties keep their submission order.
- **Batching by texture.** Consecutive sprites that share a texture become one instanced draw, at 15 floats (60 bytes) per sprite. The 10,000-sprite stress scene draws its 10,203 sprites in a single batch, because everything in it shares one atlas page.
- **Pixel-perfect by construction** (ADR-0018). Each unrotated sprite's top-left corner is snapped to a whole virtual pixel and the zoom is forced to a whole number, so every GPU lands texels identically. That is also what lets the golden images match across drivers.
- **Tilemaps in 32×32 chunks**, rebuilt only when a chunk's revision changes. Tile animation runs entirely in the vertex shader from a millisecond clock, so animated water and flowers never force a chunk to be rebuilt.
- **A virtual resolution.** By default the world is drawn at 480×270 into an sRGB target and scaled up into the window by the largest whole factor that fits, letterboxed. Textures are sRGB and blending is linear (ADR-0013).

There are three GLSL programs today: sprites, tile chunks and the upscale blit. A test asserts zero heap allocations over 100 frames of 10,000 sprites, and the benchmark that sorts and batches 10,203 sprites takes about 0.74 ms of CPU time on my machine.

<img width="960" height="540" alt="Nadir's 10,000-sprite stress scene: thousands of small pixel-art people crowding a field, with a few round trees" src="https://jabbott.dev/Nadir/media/stress-sprites.png" />

*The 10,000-sprite stress scene: 10,203 sprites in one batch.*

The newest work, M5.17, lets the renderer rebuild a shader program from new source while running. A hand-written GLSL declaration reader checks the new source against the program's interface first, and if it does not compile or does not match, the old program stays.

## Assets: two kinds of formats

ADR-0008 splits file formats in two, to keep what the shipped game parses small and easy to fuzz:

- **Authoring formats, parsed only by the offline cook:** PNG (with its own inflate), Aseprite exports, LDtk 1.5.3 levels and BMFont fonts. A WAV reader is already built and fuzzed, but the cook will only use it once the audio pipeline lands (M6.6).
- **Runtime formats the game reads:** QOI textures, KBJ (a binary JSON), the atlas, level (`.klvl`) and prefab files, and the KPAK pack file, compressed with KLZ, Nadir's own LZ77.

**The cook** (`nadir-cook`) turns `assets/` into those runtime files:

1. **Scan:** it walks the tree deterministically, refusing names that collide when case is ignored.
2. **Atlases:** it trims sprite frames and packs them with MaxRects into square QOI pages of 64 to 4096 pixels, with padding and edge extrusion.
3. **Levels and data:** it converts LDtk levels and JSONC data to the binary formats.
4. **Pack:** it writes everything into `game.kpak`: deduplicated, 16-byte aligned, KLZ-compressed only where that is smaller, with a CRC-32 per entry.

Along the way it checks its own work: the atlas files, the level files and the finished pack are each read back with the game's own readers before they are written, and prefabs are checked with the game's prefab reader. Font files will be read back too once the game has a font reader (M7.1). A cache skips unchanged work, and files are rewritten only when their bytes change. For the sandbox, 19,030 bytes of loose files pack into 5,304.

**The asset server** returns a handle immediately, decodes on its workers inside `catch_unwind` so a bad file fails only itself, and finishes GPU uploads on the main thread within the 2 ms budget. Development builds (`cargo dev`) read loose files and draw a magenta-and-black checker for a texture that fails to load; other builds, even a plain `cargo run`, read the pack when there is one. Levels load whole: every prefab entity is built before any is spawned, and if anything fails, everything the load made is removed again.

**Every parser is hardened** against hostile input:

- **Limits first:** each parser takes explicit limits (64 levels of nesting, 1 MiB strings, 8192-pixel images, 256 MiB decoded) and checks them before allocating.
- **Size claims are bounded by the format:** a claimed output size is checked against what the input could possibly hold. DEFLATE can produce at most 1,032 bytes per input byte, QOI at most a 62-pixel run per byte, and KLZ at most 255 bytes per byte.
- **Fuzzing:** a home-made mutation fuzzer runs 14 targets, from 114 seed files, for 30 seconds each in CI. The PNG and KPAK targets repair checksums so mutations reach the deeper code, and round-trip targets check their own answers.

## The quality gate

`cargo xtask ci` is the pull-request gate, and it runs twelve checks in order, stopping at the first failure:

```text
fmt  clippy  cook  test  deps  layers  crates  unsafe-audit  headers  workflows  release-no-dev  features
```

CI runs it on Linux, Windows and macOS, about 1,600 tests in all. On Linux it also renders 13 golden scenes on Mesa's software renderer and compares them with committed QOI references. Any channel may be off by up to 2 levels, and at most 0.1% of the pixels may be off by more. It also runs the fuzzer. The `features` check ties `docs/features.jsonc` to the roadmap: every ticked task must belong to a feature, and each feature records which of its tasks were ticked when its description was written. Ticking a task therefore fails CI until that feature's entry, which the demo page shows, is revisited in the same change.

Releases come from a version tag. A gate checks that CI passed on the commit, six native runners build and smoke-test each target (including a re-cook that must match the shipped pack byte for byte), crates.io is published first because it is the step that can refuse, and only then are the GitHub release, the signed apt repository and the container image published. The binaries are not code-signed yet. That is planned for the last milestone.

## The demo page

The [demo page](https://jabbott.dev/Nadir/) is built by `cargo xtask site` every time CI passes on `main`. It runs the sandbox's three scenes on the CI runner, captures 600 frames of each at 480×270, encodes them as video and shows them next to their statistics: sprites per frame, batches, tick times and the world hash. It also shows the milestone progress, the feature list generated from `features.jsonc`, and a 1 MB Linux download of the sandbox. A recording instead of a web build keeps the engine desktop-only (ADR-0029).

## How it is built

Nadir is built one roadmap task at a time, by me or by a coding agent following `AGENTS.md`. Each task has acceptance criteria and verify commands, it is ticked only when they and `cargo xtask ci` pass, and its change is reviewed and committed under its task ID. That covers 48 of the 64 commits. The rest are work outside the roadmap: setup, CI, release and docs, such as the release pipeline and the demo page, plus two benchmarks. When a decision changes, it gets an architecture decision record. There are 42 so far, 14 of them written on the first day.

The first commit was on October 12. As of November 7 there are 64 commits, about 125,000 lines of Rust (tests and comments included), and three releases, between the afternoon of November 1 and just after 1 a.m. on November 2: 0.1.0 that afternoon, 0.1.1 that night and 0.2.0 after midnight.

## Where it stands

The roadmap has 12 milestones and 87 tasks, and 46 are done:

| Milestone | Done |
|---|---|
| M0 Foundation and guardrails | 8 of 8 |
| M1 A window and events on every desktop | 4 of 6 |
| M2 GPU on every desktop | 5 of 7 |
| M3 Sprites, camera, actions: a moving character | 5 of 5 |
| M4 Simulation: ECS, reflection, collision, tilemaps | 8 of 8 |
| M5 Content pipeline | 16 of 17 |
| M6 to M11: audio, developer tools, gamepads, a vertical slice, Metal, production hardening and release | 0 of 36 |

What remains in M1 and M2 is the Windows and macOS work: hand-checking their window and event code, and the WGL and NSOpenGL contexts that will let them draw. The last task of M5 wires hot reload into the running game. The reload pieces are built (the cook's watch mode, reloading behind asset handles, and shader and texture reload in the renderer), but the game does not start the watcher yet.

You can follow along on the [demo page](https://jabbott.dev/Nadir/), read the design in [`docs/`](https://github.com/jabbott-iii/Nadir/tree/main/docs), or try the sandbox:

```bash
git clone https://github.com/jabbott-iii/Nadir.git
cd Nadir
cargo xtask cook
cargo run -p sandbox
```
