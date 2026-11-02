
#ifndef BACUS_CONFIG_H
#define BACUS_CONFIG_H

#include "bacus/log.h"

#define BACUS_CONFIG_TEXT 128

typedef struct {
    char service_name[BACUS_CONFIG_TEXT];
    char log_file[BACUS_CONFIG_TEXT];
    BacusLogLevel log_level;
} BacusConfig;

void bacus_config_defaults(BacusConfig *config);
int bacus_config_load(const char *path, BacusConfig *config);

#endif
