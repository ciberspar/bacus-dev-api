#include "bacus/diagnostics.h"
#include "bacus/arch.h"
#include "bacus/version.h"
#include "bacus/memory.h"
#include "bacus/resource_monitor.h"

#include <stdio.h>
#include <string.h>

static int test_memory(void) {
    void *memory;
    BacusMemoryStats stats;

    if (bacus_mem_init(1024 * 1024) != 0)
        return -1;

    if (bacus_mem_register_module("diagnostics", 512 * 1024) != 0) {
        bacus_mem_shutdown();
        return -1;
    }

    memory = bacus_mem_alloc("diagnostics", 128);

    if (memory == NULL) {
        bacus_mem_shutdown();
        return -1;
    }

    memset(memory, 0x5A, 128);

    if (((unsigned char *)memory)[0] != 0x5A ||
        ((unsigned char *)memory)[127] != 0x5A) {
        bacus_mem_shutdown();
        return -1;
    }

    if (bacus_mem_get_stats("diagnostics", &stats) != 0 ||
        stats.module_used != 128 ||
        stats.allocation_count != 1) {
        bacus_mem_shutdown();
        return -1;
    }

    if (bacus_mem_free(memory) != 0) {
        bacus_mem_shutdown();
        return -1;
    }

    if (bacus_mem_get_stats("diagnostics", &stats) != 0 ||
        stats.module_used != 0 ||
        stats.allocation_count != 0) {
        bacus_mem_shutdown();
        return -1;
    }

    bacus_mem_shutdown();
    return 0;
}

int bacus_diagnostics_run(void) {
    BacusResourceInfo resources;

    int failures = 0;

    printf("Bacus Dev Diagnostics\n");
    printf("---------------------\n");
    printf("Version: %s\n", BACUS_VERSION);
    printf("Architecture: %s\n", BACUS_ARCH);

    if (bacus_resource_detect(&resources) == 0) {
        printf("Memory detection: PASSED\n");
        printf("Available RAM: %zu bytes\n",
               resources.available_memory);
        printf("Recommended budget: %zu bytes\n",
               resources.recommended_budget);
    } else {
        printf("Memory detection: UNAVAILABLE\n");
    }

    if (test_memory() == 0) {
        printf("Memory manager: PASSED\n");
    } else {
        printf("Memory manager: FAILED\n");
        failures++;
    }

    if (failures == 0) {
        printf("Diagnostics: PASSED\n");
        return 0;
    }

    printf("Diagnostics: FAILED (%d)\n", failures);
    return 1;
}