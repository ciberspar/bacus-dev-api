CC = gcc

CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -O2
CPPFLAGS = -Iinclude

TARGET = build/bacus-core

SOURCES = \
	foundation/core/main.c \
	foundation/core/diagnostics.c \
	foundation/config/config.c \
	foundation/log/log.c \
	foundation/memory/memory.c \
	foundation/monitor/resource_monitor.c

.PHONY: all clean run diagnostics

all: $(TARGET)

$(TARGET): $(SOURCES)
	mkdir -p build
	$(CC) $(CPPFLAGS) $(CFLAGS) $(SOURCES) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

diagnostics: $(TARGET)
	./$(TARGET) --diagnostics

clean:
	rm -rf build