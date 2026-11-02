# Bacus Dev

**Independent infrastructure toolkit for developers.**

Bacus Dev is an experimental infrastructure project
focused on providing modular services and tools
for developers and self-hosted environments.

## Current version

- Version: 0.1-RC1
- Codename: Adaptive Core
- Stage: Release Candidate
- Build: BD-RC01

## Features

- Modular C foundation.
- Configuration system.
- File-based logging.
- Architecture detection.
- Core diagnostics.
- Adaptive Memory Manager.
- Linux resource detection.
- Multi-architecture builds.

## Supported build targets

| Target | Architecture |
|---|---|
| linux-x86 | 32-bit x86 |
| linux-x86_64 | 64-bit x86 |
| linux-armv6 | 32-bit ARMv6 |
| linux-arm64 | 64-bit ARM |

## Build

Requirements:

- GCC
- GNU Make
- Linux

Compile:

    make

Run:

    make run

Run diagnostics:

    make diagnostics

Show version:

    ./build/bacus-core --version

## Adaptive Memory

Bacus Dev includes an initial memory management
system with:

- Module registration.
- Allocation tracking.
- Per-module memory limits.
- Global memory limits.
- Resource detection.
- Memory state management.

The current implementation is single-threaded
and does not manage memory belonging to
external processes.

## Project status

Bacus Dev is experimental.

It is not production-ready. Hardware compatibility,
security, concurrency, networking and persistent
storage still require implementation and testing.

## Philosophy

- Open standards.
- Modular architecture.
- Resource efficiency.
- Self-hosting.
- Hardware adaptability.
- No mandatory managed backend.

## License

See LICENSE.