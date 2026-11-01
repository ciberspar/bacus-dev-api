
CC = gcc
CFLAGS = -std=c11 -Wall -Wextra -Wpedantic -O2
INCLUDES = -Iinclude

TARGET = build/bacus-core
SOURCE = foundation/core/main.c

.PHONY: all clean run

all: $(TARGET)

$(TARGET): $(SOURCE) include/bacus/version.h
	mkdir -p build
	$(CC) $(CFLAGS) $(INCLUDES) $(SOURCE) -o $(TARGET)

run: all
	./$(TARGET)

clean:
	rm -rf build
