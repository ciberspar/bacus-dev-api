# Changelog

* All notable changes to Bacus Dev are documented here.

# [0.1-RC1] - 2026-11-02

##Added

* Initial Adaptive Core release candidate.
* Adaptive Memory Manager.
* Centralized memory allocation tracking.
* Per-module memory limits.
* Global memory limits.
* Memory state management:
    * NORMAL
    * PRESSURE
    * CRITICAL
    * RECOVERY
* Linux system memory detection through /proc/meminfo.
* Recommended memory budget calculation.
* Resource Monitor foundation.
* Memory manager diagnostics.
* Memory allocation and release tests.

## Improved

* Core initialization sequence.
* Resource handling.
* Diagnostic reporting.
* Project documentation.
* Multi-architecture build workflow.

## Build Targets

* Linux x86 (32-bit).
* Linux x86_64 (64-bit).
* Linux ARMv6 (32-bit).
* Linux ARM64 (64-bit).

## Known Limitations

* Memory Manager is currently single-threaded.
* Adaptive pressure transitions are not fully implemented.
* External process memory is not managed.
* HTTP server is not integrated into the C core.
* Authentication and persistent storage are not implemented.
* ARMv6 runtime compatibility requires hardware testing.

⸻

# [0.1-beta2] - 2026-11-01

## Added

* Centralized configuration system.
* File-based logging.
* Log levels:
    * DEBUG
    * INFO
    * WARN
    * ERROR
* Compile-target architecture detection.
* Core diagnostics.
* CLI arguments:
    * --help
    * --version
    * --diagnostics
    * --config
* Multi-architecture build pipeline.

## Improved

* Modular C core.
* Configuration validation.
* Build organization.
* Development structure.

## Known Limitations

* No HTTP server integrated into the C core.
* No authentication system.
* No persistent database.
* No production deployment.
* Hardware compatibility still requires testing.

⸻

# [0.1-beta1] - 2026-11-01

## Added

* Initial Bacus Dev foundation.
* C-based core entry point.
* Version identification system.
* Initial project architecture.
* ARMv6 hardware target.
* GitHub automated build workflow.
* Initial compilation tests.

## Build Targets

* Linux x86 (32-bit).
* Linux x86_64 (64-bit).
* Linux ARMv6 (32-bit).
* Linux ARM64 (64-bit).

## Development

* Portable C foundation.
* Initial multi-architecture compilation.
* No external backend dependencies.

## Known Limitations

* No HTTP API.
* No authentication.
* No persistent storage.
* Not production-ready.

⸻

## Version History

Version	Codename	Stage
0.1-beta1	Foundation	Beta
0.1-beta2	Core Upgrade	Beta
0.1-RC1	Adaptive Core	Release Candidate

## Project Philosophy

Bacus Dev aims to provide modular, resource-efficient and independent infrastructure tools for developers and self-hosted environments.

## The project prioritizes:

* Open standards.
* Hardware adaptability.
* Memory efficiency.
* Security.
* Reliability.
* Multi-architecture support.
* Self-hosted infrastructure.