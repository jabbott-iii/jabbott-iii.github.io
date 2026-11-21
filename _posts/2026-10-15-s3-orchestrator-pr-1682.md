---
layout: post
title: "Contribution: s3-orchestrator #1682 - Nomad and Kubernetes Demo Services"
date: 2026-10-15 09:00:00 -0700
categories: [intro]
project: open-source
kind: Contribution
description: "Pull request #1682 to s3-orchestrator is merged: the Nomad and Kubernetes demos now run MinIO, PostgreSQL, Redis and the full observability stack inside the scheduler they demonstrate, instead of docker-compose."
---

# [s3-orchestrator #1682: run the demo backing services in Nomad and Kubernetes](https://github.com/afreidah/s3-orchestrator/pull/1682)

[s3-orchestrator](https://github.com/afreidah/s3-orchestrator) presents many S3 and blob storage providers as a single S3 endpoint. (Amazon S3 stores files as objects in buckets, and many other services offer its API; blob storage is the same idea.) It keeps a configurable number of copies across them with read failover (if one copy can't be read, it reads another). It can also add per-backend (per-provider) byte, request, ingress (data in), and egress (data out) limits, zstd (Zstandard) compression, and envelope encryption (data is encrypted with a data key, which is itself encrypted with a master key).

My pull request #1682 was merged on October 15. It closes [issue #265](https://github.com/afreidah/s3-orchestrator/issues/265), which asked for each demo to run its dependencies inside the system it demonstrates. It is my largest contribution so far: 1,928 lines added and 137 removed across 27 files.

## The problem

The project ships two local demos, one on HashiCorp Nomad and one on Kubernetes (k3d). Nomad and Kubernetes are schedulers: they decide where workloads such as containers run, and keep them running. k3d runs a small Kubernetes cluster inside Docker.

Both demos ran only the orchestrator itself in the scheduler. Its backing services (the services it depends on) still started through `docker-compose`, a tool that starts a group of containers from one YAML file. These were three MinIO backends (self-hosted, S3-compatible storage servers), PostgreSQL, and Redis (an in-memory data store). The observability stack, which shows what the system is doing, also started that way: Prometheus (metrics), Grafana (dashboards), Tempo (traces of each request's path), Loki (logs), and Alloy (which collects and forwards this data).

As the issue put it, a Nomad demo should use Nomad, and a Kubernetes demo should use Kubernetes. The goal was to make each demo self-contained in the scheduler it shows off, while keeping `docker-compose.test.yml` for `make run` and `make dev-deps`.

## The Nomad demo

- **Backing services job** (`services.nomad.hcl`): PostgreSQL, Redis and three MinIO backends. (A Nomad job lists tasks to run; here, each task is a container.) They register in Nomad's built-in service registry with `provider = "nomad"` and `address_mode = "driver"`, so the registry holds each container's own address. The dev agent (Nomad running in its single-machine development mode) advertises and publishes ports on 127.0.0.1, which other containers can't reach, so registering the host address would not have worked. The host ports match the ones compose used, bound to localhost, so `psql`, `redis-cli`, and `mc` (the MinIO client) on the host work the same way.
- **Bucket setup as a batch job** (`minio-setup.nomad.hcl`): a one-shot job that creates the backend buckets, using addresses from the registry.
- **Observability job** (`observability.nomad.hcl`): Prometheus, Grafana, Tempo, Loki and Alloy, with the same images as compose and the `deploy/monitoring` configs bind-mounted (mounted from the host into the containers). Prometheus, Tempo and Loki use the host network (sharing the host's network instead of getting their own addresses), as in compose, so Prometheus still discovers the orchestrator instances through the Nomad API.
- **Agent configuration** (`agent.hcl`): turns on memory oversubscription, so each task reserves little memory and bursts to its `memory_max` under load, and the whole stack still fits beside the orchestrator fleet on a laptop.
- **Orchestrator job**: the config's backing-service addresses are now `nomadService` template lookups, which Nomad fills in from the registry when it renders (writes) the config file. A 30-second template `wait` (Nomad lets registry changes settle that long before re-rendering) means a service that briefly drops out of the registry while restarting never gets rendered into the config.
- **`demo.sh`**: submits the jobs, waits for healthy allocations (running instances of a job's tasks) and `pg_isready` (PostgreSQL's readiness check), then runs the bucket setup. On a reused agent, it checks for bind-mount support and memory oversubscription before starting.

## The Kubernetes demo

- **`services.yaml`**: PostgreSQL, Redis and three MinIO backends in a `demo` namespace (a named group of resources), with local-path persistent volume claims (requests for storage that outlives a container).
- **`minio-setup.yaml`**: the bucket setup as a Kubernetes Job (which runs to completion instead of staying up), deleted and re-applied on each run.
- **`observability.yaml`**: Prometheus, Grafana, Tempo and Loki. Grafana, Prometheus and Tempo are LoadBalancer Services (stable addresses reachable from outside the cluster) on ports 13000, 19090 and 3200, published through k3d's load balancer.
- **Alloy** reaches Loki and Prometheus by cluster DNS (the cluster's internal Domain Name System) instead of the host gateway (the host machine's address).
- **`demo.sh`**: creates the cluster with the extra port mappings and loads the `deploy/monitoring` configs into ConfigMaps (Kubernetes objects that hold config data) with server-side apply (the cluster, not the client, merges the changes). It then waits for the backing services and the bucket Job, and fills the shared config with cluster DNS names. It warns when a reused cluster is missing the new port mappings.

## Shared changes

- **One placeholder per address.** `deploy/local/config.yaml` has a placeholder for each backing-service address, replacing the single `__HOST_IP__`.
- **A stricter config renderer.** `render_config` in `deploy/local/lib.sh` takes `NAME=value` pairs and fails on any placeholder left unfilled. It avoids bash's `${var//}` pattern substitution, so it also works on the bash 3.2 that macOS ships.
- **A port guard.** `refuse_running_dev_deps` stops a demo from starting while the compose stack from `make dev-deps` holds the same ports.
- **Environment-driven URLs.** Grafana's datasource URLs come from `PROMETHEUS_URL`, `LOKI_URL`, and `TEMPO_URL`, and Tempo's remote-write URL (where it sends metrics) comes from `PROMETHEUS_REMOTE_WRITE_URL`. The same monitoring configs therefore work under compose, Nomad, and Kubernetes. `docker-compose.test.yml` sets the values it used before.
- **Docs.** `deploy/README.md`, `docs/deployment.md`, `docs/monitoring.md`, the web demo guide and the file headers that described the demos as compose-backed.

## How I checked it

The change has no Go code, so the Go tests and linters didn't apply. Before opening the pull request, I ran static checks (checks that inspect files without running them) on everything it touched:

- shellcheck (a linter for shell scripts) reports no issues in both `demo.sh` scripts, `lib.sh`, and the bucket setup scripts.
- Every Nomad file parses as HCL (HashiCorp Configuration Language), including the orchestrator job as `demo.sh` renders it.
- With a stub `nomadService` (a stand-in for the registry lookup), the rendered config matches `deploy/local/config.yaml` apart from the addresses.
- kubeconform (a validator for Kubernetes YAML files) in strict mode against Kubernetes 1.33 validates all 37 resources.
- `docker compose -f docker-compose.test.yml config` passes.
- `render_config` produces identical output under `BASH_COMPAT=31`, `BASH_COMPAT=42` (settings that mimic bash 3.1 and 4.2), and native bash.

## Review

The maintainer pulled the branch and tested it against Nomad 2.0.7 and the k3d demo, including the project's `make perf` load scenarios. That hands-on run found problems static checks couldn't, and I fixed each one in follow-up commits:

1. **Docker volumes are off in Nomad dev mode.** `nomad agent -dev` doesn't enable Docker bind mounts, so every observability task failed to start. `agent.hcl` now turns them on.
2. **Data was landing in RAM.** The dev agent's task directories live on tmpfs (a filesystem held in memory) on most Linux machines. Data stored there counted against each container's memory, and MinIO was OOM-killed (killed for running out of memory) partway through the multipart perf scenario. PostgreSQL and the three MinIO backends now keep their data in Docker named volumes (disk storage Docker manages outside the container), as compose did, and all seven perf scenarios pass.
3. **Teardown orphaned containers.** `demo.sh down` stopped the jobs and killed the agent before their containers had exited, leaving those containers behind unmanaged. It now waits for the containers and the agent, removes anything left over from an earlier run, and deletes the demo's volumes.
4. **One teardown path.** `make clean` assumed compose still owned the backing services. It now calls `demo.sh down`.
5. **Formatting.** `nomad fmt -recursive deploy/nomad/` realigned the health check blocks.
6. **Grafana under load.** With a dashboard open during `make perf`, Grafana went past its 1 GiB limit, so both demos now let it burst to 2 GiB.

A final commit restored the executable bit on `demo.sh`, which an earlier commit had dropped. The maintainer confirmed everything from the review worked and merged the pull request on October 15. They also complimented using a Nomad batch job for the MinIO bucket setup.

## Notes for anyone running the demos

- Stop `make dev-deps` before starting a demo. The demos use the same host ports, and the scripts refuse to start while it is running.
- On Nomad, a restarted backing service usually comes back at a new container address. Backend and database addresses don't reload on `SIGHUP` (the signal that tells the orchestrator to reload its config), so the orchestrator fleet restarts once, about 30 seconds later, to pick up the new address.
- The Nomad demo still needs native Docker Engine on Linux, for host networking and `/var/run/docker.sock` (Docker's control socket).

s3-orchestrator welcomes contributions, and the maintainer has suggested a few Go-side issues as good next steps for new contributors.
