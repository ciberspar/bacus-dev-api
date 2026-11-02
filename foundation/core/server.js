import http from "node:http";
import os from "node:os";

const BACUS = {
  name: "Bacus Dev",
  version: "0.1-RC1.2",
  codename: "Adaptive Core",
  build: "BD-RC1.2"
};

const HOST = process.env.BACUS_HOST || "127.0.0.1";
const PORT = Number(process.env.BACUS_PORT || 8080);
const START_TIME = Date.now();

function sendJSON(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Powered-By": "Bacus-Dev"
  });

  res.end(JSON.stringify(data, null, 2));
}

function getMemoryMetrics() {
  const memory = process.memoryUsage();

  return {
    rss: memory.rss,
    heap_used: memory.heapUsed,
    heap_total: memory.heapTotal,
    external: memory.external,
    unit: "bytes"
  };
}

function router(req, res) {
  let pathname;

  try {
    pathname = new URL(
      req.url,
      `http://${req.headers.host || "localhost"}`
    ).pathname;
  } catch {
    return sendJSON(res, 400, {
      error: "BAD_REQUEST",
      message: "Invalid request URL"
    });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJSON(res, 405, {
      error: "METHOD_NOT_ALLOWED",
      message: "Only GET requests are supported"
    });
  }

  // API home
  if (pathname === "/") {
    return sendJSON(res, 200, {
      ...BACUS,
      status: "operational",
      api: "/api/v1",
      health: "/health"
    });
  }

  // Health check
  if (pathname === "/health") {
    return sendJSON(res, 200, {
      status: "healthy",
      service: "bacus-dev-api",
      uptime_seconds: Math.floor(process.uptime())
    });
  }

  // API information
  if (pathname === "/api/v1/info") {
    return sendJSON(res, 200, {
      ...BACUS,
      runtime: {
        name: "Node.js",
        version: process.version,
        platform: process.platform,
        architecture: process.arch
      },
      system: {
        operating_system: os.type(),
        release: os.release(),
        available_parallelism:
          os.availableParallelism?.() ?? os.cpus().length
      }
    });
  }

  // Process metrics
  if (pathname === "/api/v1/metrics") {
    return sendJSON(res, 200, {
      service: "bacus-dev-api",
      uptime_seconds: Math.floor(process.uptime()),
      memory: getMemoryMetrics(),
      process: {
        pid: process.pid,
        uptime_seconds: process.uptime()
      },
      collected_at: new Date().toISOString()
    });
  }

  return sendJSON(res, 404, {
    error: "NOT_FOUND",
    message: "The requested endpoint does not exist",
    path: pathname
  });
}

const server = http.createServer((req, res) => {
  try {
    router(req, res);
  } catch (error) {
    console.error("[Bacus Dev] Request error:", error.message);

    if (!res.headersSent) {
      sendJSON(res, 500, {
        error: "INTERNAL_SERVER_ERROR",
        message: "An internal error occurred"
      });
    } else {
      res.destroy();
    }
  }
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 50;

server.on("error", (error) => {
  console.error("[Bacus Dev] Server error:", error.message);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log("================================");
  console.log("       BACUS DEV API");
  console.log("================================");
  console.log(`Version: ${BACUS.version}`);
  console.log(`Build:   ${BACUS.build}`);
  console.log(`Host:    ${HOST}`);
  console.log(`Port:    ${PORT}`);
  console.log("--------------------------------");
  console.log("HTTP server: READY");
  console.log("================================");
});

function shutdown(signal) {
  console.log(`\n[Bacus Dev] Received ${signal}`);

  server.close(() => {
    console.log("[Bacus Dev] Server stopped.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[Bacus Dev] Forced shutdown.");
    process.exit(1);
  }, 5000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));