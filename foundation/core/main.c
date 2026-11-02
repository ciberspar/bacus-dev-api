
#include <stdio.h>
#include "bacus/version.h"

int main(void) {
    printf("\n");
    printf("================================\n");
    printf("          BACUS DEV\n");
    printf("================================\n");

    printf("Version:      %s\n", BACUS_VERSION);
    printf("Codename:     %s\n", BACUS_CODENAME);
    printf("Build:        %s\n", BACUS_BUILD);
    printf("Stage:        %s\n", BACUS_STAGE);

    printf("--------------------------------\n");
    printf("Core:         INITIALIZED\n");
    printf("Architecture: PORTABLE C\n");
    printf("Status:       DEVELOPMENT\n");
    printf("--------------------------------\n");

    printf("Welcome to Bacus Dev!\n\n");

    return 0;
}
