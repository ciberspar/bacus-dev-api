#include "bacus/version.h"
#include "bacus/arch.h"
#include "bacus/log.h"
#include "bacus/config.h"
#include "bacus/diagnostics.h"
#include "bacus/memory.h"
#include "bacus/resource_monitor.h"

#include <stdio.h>
#include <string.h>

#define BACUS_FALLBACK_MEMORY (4U * 1024U * 1024U)

static void show_help(void) {
    printf("Bacus Dev %s\n\n", BACUS_VERSION);
    printf("Usage: bacus-core [options]\n\n");
    printf("Options:\n");
    printf("  --help             Show help\n");
    printf("  --version          Show version\n");
    printf("  --diagnostics      Run diagnostics\n");
    printf("  --config FILE      Load configuration\n");
}

int main(int argc, char **argv) {
    BacusConfig config;
    BacusResourceInfo resources;

    const char *config_path = "config/bacus.conf";
    size_t memory_budget = BACUS_FALLBACK_MEMORY;

    int i;
    int result;

    for (i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--help") == 0) {
            show_help();
            return 0;
        }

        if (strcmp(argv[i], "--version") == 0) {
            printf("%s %s (%s)\n",
                   BACUS_NAME, BACUS_VERSION, BACUS_BUILD);
            return 0;
        }

        if (strcmp(argv[i], "--diagnostics") == 0) {
            return bacus_diagnostics_run();
        }

        if (strcmp(argv[i], "--config") == 0) {
            if (i + 1 >= argc) {
                fprintf(stderr, "Missing config filename\n");
                return 2;
            }

            config_path = argv[++i];
            continue;
        }

        fprintf(stderr, "Unknown option: %s\n", argv[i]);
        show_help();
        return 2;
    }

    bacus_config_defaults(&config);

    result = bacus_config_load(config_path, &config);

    if (result < 0) {
        fprintf(stderr, "Invalid configuration: %s\n", config_path);
        return 1;
    }

    if (result == 1) {
        fprintf(stderr,
                "Configuration not found; using defaults.\n");
    }

    if (bacus_resource_detect(&resources) == 0) {
        memory_budget = resources.recommended_budget;
    } else {
        fprintf(stderr,
                "Resource detection unavailable; using fallback.\n");
    }

    if (bacus_mem_init(memory_budget) != 0) {
        fprintf(stderr, "Memory manager initialization failed.\n");
        return 1;
    }

    if (bacus_mem_register_module("core", memory_budget) != 0) {
        fprintf(stderr, "Core memory registration failed.\n");
        bacus_mem_shutdown();
        return 1;
    }

    if (bacus_log_init(config.log_file,
                       config.log_level) != 0) {
        fprintf(stderr, "Cannot open log file.\n");
        bacus_mem_shutdown();
        return 1;
    }

    printf("%s %s\n", BACUS_NAME, BACUS_VERSION);
    printf("Codename: %s\n", BACUS_CODENAME);
    printf("Service: %s\n", config.service_name);
    printf("Architecture: %s\n", BACUS_ARCH);
    printf("Memory budget: %zu bytes\n", memory_budget);
    printf("Adaptive Memory: initialized\n");
    printf("Core: initialized\n");

    bacus_log(BACUS_LOG_INFO, "Bacus Dev core initialized");

    bacus_log_close();
    bacus_mem_shutdown();

    return 0;
}