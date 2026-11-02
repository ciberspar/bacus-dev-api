
#include "bacus/log.h"

#include <stdio.h>
#include <time.h>

static FILE *log_file = NULL;
static BacusLogLevel minimum_level = BACUS_LOG_INFO;

static const char *level_name(BacusLogLevel level) {
    switch (level) {
        case BACUS_LOG_DEBUG: return "DEBUG";
        case BACUS_LOG_INFO:  return "INFO";
        case BACUS_LOG_WARN:  return "WARNING";
        case BACUS_LOG_ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

int bacus_log_init(const char *path, BacusLogLevel level) {
    minimum_level = level;

    if (path == NULL || path[0] == '\0')
        return 0;

    log_file = fopen(path, "a");

    return log_file == NULL ? -1 : 0;
}

void bacus_log_close(void) {
    if (log_file != NULL) {
        fclose(log_file);
        log_file = NULL;
    }
}

void bacus_log(BacusLogLevel level, const char *message) {
    time_t now;
    struct tm *local;
    char timestamp[32] = "unknown-time";

    if (message == NULL || level < minimum_level)
        return;

    now = time(NULL);
    local = localtime(&now);

    if (local != NULL)
        strftime(timestamp, sizeof(timestamp),
                 "%Y-%m-%d %H:%M:%S", local);

    fprintf(stderr, "[%s] [%s] %s\n",
            timestamp, level_name(level), message);

    if (log_file != NULL) {
        fprintf(log_file, "[%s] [%s] %s\n",
                timestamp, level_name(level), message);
        fflush(log_file);
    }
}
