
#include "bacus/config.h"

#include <stdio.h>
#include <string.h>
#include <ctype.h>

static char *trim(char *text) {
    char *end;

    while (isspace((unsigned char)*text))
        text++;

    end = text + strlen(text);

    while (end > text && isspace((unsigned char)end[-1]))
        *--end = '\0';

    return text;
}

static int copy_value(char *destination,
                      size_t size,
                      const char *value) {
    size_t length = strlen(value);

    if (length >= size)
        return -1;

    memcpy(destination, value, length + 1);
    return 0;
}

static int parse_level(const char *value,
                       BacusLogLevel *level) {
    if (strcmp(value, "DEBUG") == 0)
        *level = BACUS_LOG_DEBUG;
    else if (strcmp(value, "INFO") == 0)
        *level = BACUS_LOG_INFO;
    else if (strcmp(value, "WARN") == 0)
        *level = BACUS_LOG_WARN;
    else if (strcmp(value, "ERROR") == 0)
        *level = BACUS_LOG_ERROR;
    else
        return -1;

    return 0;
}

void bacus_config_defaults(BacusConfig *config) {
    if (config == NULL)
        return;

    memset(config, 0, sizeof(*config));

    strcpy(config->service_name, "bacus-dev");
    strcpy(config->log_file, "bacus.log");
    config->log_level = BACUS_LOG_INFO;
}

int bacus_config_load(const char *path,
                      BacusConfig *config) {
    FILE *file;
    char line[256];

    if (path == NULL || config == NULL)
        return -1;

    file = fopen(path, "r");

    if (file == NULL)
        return 1;

    while (fgets(line, sizeof(line), file) != NULL) {
        char *key;
        char *value;
        char *separator;

        if (strchr(line, '\n') == NULL && !feof(file)) {
            fclose(file);
            return -1;
        }

        key = trim(line);

        if (*key == '\0' || *key == '#')
            continue;

        separator = strchr(key, '=');

        if (separator == NULL) {
            fclose(file);
            return -1;
        }

        *separator = '\0';
        value = trim(separator + 1);
        key = trim(key);

        if (strcmp(key, "service_name") == 0) {
            if (copy_value(config->service_name,
                           sizeof(config->service_name),
                           value) != 0) {
                fclose(file);
                return -1;
            }
        } else if (strcmp(key, "log_file") == 0) {
            if (copy_value(config->log_file,
                           sizeof(config->log_file),
                           value) != 0) {
                fclose(file);
                return -1;
            }
        } else if (strcmp(key, "log_level") == 0) {
            if (parse_level(value, &config->log_level) != 0) {
                fclose(file);
                return -1;
            }
        } else {
            fclose(file);
            return -1;
        }
    }

    if (ferror(file)) {
        fclose(file);
        return -1;
    }

    fclose(file);
    return 0;
}
