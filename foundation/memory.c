#include "bacus/memory.h"

#include <stdlib.h>
#include <string.h>

typedef struct Allocation {
    void *ptr;
    size_t size;
    size_t module_index;
    struct Allocation *next;
} Allocation;

typedef struct {
    char name[BACUS_MEMORY_NAME_SIZE];
    size_t limit;
    size_t used;
    size_t allocations;
    int active;
} MemoryModule;

static MemoryModule modules[BACUS_MEMORY_MAX_MODULES];
static Allocation *allocations = NULL;

static size_t total_limit = 0;
static size_t total_used = 0;
static size_t allocation_count = 0;

static BacusMemoryState memory_state =
    BACUS_MEMORY_NORMAL;

static int initialized = 0;

static int find_module(const char *name) {
    size_t i;

    if (name == NULL)
        return -1;

    for (i = 0; i < BACUS_MEMORY_MAX_MODULES; i++) {
        if (modules[i].active &&
            strcmp(modules[i].name, name) == 0) {
            return (int)i;
        }
    }

    return -1;
}

int bacus_mem_init(size_t limit) {
    if (initialized || limit == 0)
        return -1;

    memset(modules, 0, sizeof(modules));

    total_limit = limit;
    total_used = 0;
    allocation_count = 0;
    allocations = NULL;

    memory_state = BACUS_MEMORY_NORMAL;
    initialized = 1;

    return 0;
}

int bacus_mem_register_module(
    const char *name,
    size_t limit
) {
    size_t i;
    size_t length;

    if (!initialized ||
        name == NULL ||
        limit == 0) {
        return -1;
    }

    length = strlen(name);

    if (length == 0 ||
        length >= BACUS_MEMORY_NAME_SIZE) {
        return -1;
    }

    if (find_module(name) >= 0)
        return -1;

    for (i = 0; i < BACUS_MEMORY_MAX_MODULES; i++) {
        if (!modules[i].active) {
            memcpy(modules[i].name, name, length + 1);
            modules[i].limit = limit;
            modules[i].used = 0;
            modules[i].allocations = 0;
            modules[i].active = 1;
            return 0;
        }
    }

    return -1;
}

void *bacus_mem_alloc(
    const char *module,
    size_t size
) {
    int index;
    void *ptr;
    Allocation *record;

    if (!initialized ||
        size == 0 ||
        memory_state == BACUS_MEMORY_CRITICAL) {
        return NULL;
    }

    index = find_module(module);

    if (index < 0)
        return NULL;

    if (size > total_limit - total_used)
        return NULL;

    if (size > modules[index].limit -
               modules[index].used) {
        return NULL;
    }

    ptr = malloc(size);

    if (ptr == NULL)
        return NULL;

    record = malloc(sizeof(*record));

    if (record == NULL) {
        free(ptr);
        return NULL;
    }

    record->ptr = ptr;
    record->size = size;
    record->module_index = (size_t)index;
    record->next = allocations;

    allocations = record;

    total_used += size;
    modules[index].used += size;

    allocation_count++;
    modules[index].allocations++;

    return ptr;
}

int bacus_mem_free(void *ptr) {
    Allocation **current;

    if (!initialized || ptr == NULL)
        return -1;

    current = &allocations;

    while (*current != NULL) {
        Allocation *record = *current;

        if (record->ptr == ptr) {
            size_t index = record->module_index;

            *current = record->next;

            total_used -= record->size;
            modules[index].used -= record->size;

            allocation_count--;
            modules[index].allocations--;

            free(record->ptr);
            free(record);

            return 0;
        }

        current = &record->next;
    }

    return -1;
}

int bacus_mem_get_stats(
    const char *module,
    BacusMemoryStats *stats
) {
    int index;

    if (!initialized || stats == NULL)
        return -1;

    memset(stats, 0, sizeof(*stats));

    stats->total_limit = total_limit;
    stats->total_used = total_used;
    stats->allocation_count = allocation_count;
    stats->state = memory_state;

    if (module == NULL)
        return 0;

    index = find_module(module);

    if (index < 0)
        return -1;

    stats->module_limit = modules[index].limit;
    stats->module_used = modules[index].used;
    stats->module_allocations =
        modules[index].allocations;

    return 0;
}

void bacus_mem_set_state(BacusMemoryState state) {
    if (state >= BACUS_MEMORY_NORMAL &&
        state <= BACUS_MEMORY_RECOVERY) {
        memory_state = state;
    }
}

void bacus_mem_shutdown(void) {
    Allocation *current;

    if (!initialized)
        return;

    current = allocations;

    while (current != NULL) {
        Allocation *next = current->next;

        free(current->ptr);
        free(current);

        current = next;
    }

    allocations = NULL;

    memset(modules, 0, sizeof(modules));

    total_limit = 0;
    total_used = 0;
    allocation_count = 0;

    initialized = 0;
}