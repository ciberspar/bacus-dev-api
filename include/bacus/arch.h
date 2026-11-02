
#ifndef BACUS_ARCH_H
#define BACUS_ARCH_H

#if defined(__aarch64__)
#define BACUS_ARCH "ARM64"

#elif defined(__arm__)
#if defined(__ARM_ARCH) && __ARM_ARCH == 6
#define BACUS_ARCH "ARMv6"
#elif defined(__ARM_ARCH) && __ARM_ARCH < 6
#define BACUS_ARCH "ARM32 (anterior a ARMv6)"
#else
#define BACUS_ARCH "ARM32"
#endif

#elif defined(__x86_64__)
#define BACUS_ARCH "x86_64"

#elif defined(__i386__)
#define BACUS_ARCH "x86"

#else
#define BACUS_ARCH "Unknown"
#endif

#endif
