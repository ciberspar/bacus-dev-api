#ifndef BACUS_MEMORY_H
#define BACUS_MEMORY_H

#include <stddef.h>
#include <stdint.h>

#define BACUS_MEMORY_MAX_MODULES 16
#define BACUS_MEMORY_NAME_SIZE 32

typedef enum {
    BACUS_MEMORY_NORMAL = 0,
    BACUS_MEMORY_PRESSURE,
    BACUS_MEMORY_CRITICAL,
    BACUS_MEMORY_RECOVERY
} BacusMemoryState;

typedef struct {
    size_t total_limit;
    size_t total_used;
    size_t allocation_count;
    size_t module_limit;
    size_t module_used;
    size_t module_allocations;
    BacusMemoryState state;
} BacusMemoryStats;

int bacus_mem_init(size_t total_limit);
int bacus_mem_register_module(
    const char *name,
    size_t limit
);

void *bacus_mem_alloc(
    const char *module,
    size_t size
);

int bacus_mem_free(void *ptr);

int bacus_mem_get_stats(
    const char *module,
    BacusMemoryStats *stats
);

void bacus_mem_set_state(BacusMemoryState state);
void bacus_mem_shutdown(void);

#endif