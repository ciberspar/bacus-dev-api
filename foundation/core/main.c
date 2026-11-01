
#include <stdio.h>
#include "bacus/version.h"

int main(void) {
    printf("%s\n", BACUS_NAME);
    printf("Version: %s\n", BACUS_VERSION);
    printf("Stage: %s\n", BACUS_STAGE);
    printf("Architecture: portable C\n");
    printf("Status: initialized\n");

    return 0;
}
