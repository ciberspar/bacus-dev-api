
#ifndef BACUS_LOG_H
#define BACUS_LOG_H

typedef enum {
    BACUS_LOG_DEBUG = 0,
    BACUS_LOG_INFO,
    BACUS_LOG_WARN,
    BACUS_LOG_ERROR
} BacusLogLevel;

int bacus_log_init(const char *path, BacusLogLevel level);
void bacus_log_close(void);
void bacus_log(BacusLogLevel level, const char *message);

#endif
