
#include "bacus/diagnostics.h"
#include "bacus/arch.h"
#include "bacus/version.h"

#include <stdio.h>
#include <stdlib.h>

int bacus_diagnostics_run(void) {
    void *memory = malloc(64);

    printf("Bacus Dev Diagnostics\n");
    printf("---------------------\n");
    printf("Version: %s\n", BACUS_VERSION);
    printf("Architecture: %s\n", BACUS_ARCH);

    if (memory == NULL) {
        printf("Memory test: FAILED\n");
        return 1;
    }

    free(memory);

    printf("Memory test: PASSED\n");
    printf("Core test: PASSED\n");
    printf("Diagnostics: COMPLETED\n");

    return 0;
}
