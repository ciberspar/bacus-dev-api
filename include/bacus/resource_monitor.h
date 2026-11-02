#ifndef BACUS_RESOURCE_MONITOR_H
#define BACUS_RESOURCE_MONITOR_H

#include <stddef.h>

typedef struct {
    size_t total_memory;
    size_t available_memory;
    size_t recommended_budget;
} BacusResourceInfo;

int bacus_resource_detect(BacusResourceInfo *info);

#endif