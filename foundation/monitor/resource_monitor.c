#include "bacus/resource_monitor.h"

#include <stdio.h>
#include <stdint.h>
#include <limits.h>
#include <string.h>

int bacus_resource_detect(BacusResourceInfo *info) {
    FILE *file;
    char line[256];

    uint64_t total_kb = 0;
    uint64_t available_kb = 0;
    uint64_t bytes;

    if (info == NULL)
        return -1;

    memset(info, 0, sizeof(*info));

    file = fopen("/proc/meminfo", "r");

    if (file == NULL)
        return -1;

    while (fgets(line, sizeof(line), file) != NULL) {
        unsigned long long value = 0;

        if (sscanf(line, "MemTotal: %llu kB", &value) == 1) {
            total_kb = (uint64_t)value;
        }

        if (sscanf(line, "MemAvailable: %llu kB", &value) == 1) {
            available_kb = (uint64_t)value;
        }

        if (sscanf(line, "MemFree: %llu kB", &value) == 1 &&
            available_kb == 0) {
            available_kb = (uint64_t)value;
        }
    }

    fclose(file);

    if (total_kb == 0 || available_kb == 0)
        return -1;

    if (total_kb > UINT64_MAX / 1024 ||
        available_kb > UINT64_MAX / 1024) {
        return -1;
    }

    bytes = total_kb * 1024;

    info->total_memory =
        bytes > SIZE_MAX ? SIZE_MAX : (size_t)bytes;

    bytes = available_kb * 1024;

    info->available_memory =
        bytes > SIZE_MAX ? SIZE_MAX : (size_t)bytes;

    /*
     * Initial conservative policy:
     * use at most one eighth of currently available RAM.
     * This is a starting heuristic, not a performance guarantee.
     */

    info->recommended_budget =
        info->available_memory / 8;

    return info->recommended_budget > 0 ? 0 : -1;
}