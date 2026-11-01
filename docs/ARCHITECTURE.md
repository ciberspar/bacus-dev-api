
# Bacus Dev Architecture

## Objective

Build an independently controlled infrastructure
platform with modular services.

## Main components

- Foundation: central runtime.
- Network: communication and API gateway.
- Security: identities and permissions.
- Storage: persistent data.
- Services: independent platform modules.
- Admin: infrastructure management.

## Hardware target

Initial target:
- Raspberry Pi Zero v1.3
- ARMv6, 32-bit
- 512 MB RAM
- Linux

## Principles

- Minimal resource consumption.
- No managed backend platforms.
- Open network standards.
- Modular architecture.
- Security by design.

## Current implementation

Foundation 0.1.0:
- Initial C executable.
- Portable source code.
- Build with GCC and Make.
