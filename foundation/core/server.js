
import http from "node:http";

const HOST = process.env.BACUS_HOST || "127.0.0.1";
const PORT = Number(process.env.BACUS_PORT || 8080);

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Powered-By", "Bacus-Dev");

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      name: "Bacus Dev",
      version: "0.1.0",
      status: "operational",
      architecture: "independent",
      message: "Welcome to Bacus Dev"
    }));
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      status: "healthy",
      service: "bacus-core"
    }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    error: "NOT_FOUND",
    message: "Endpoint not found"
  }));
});

server.listen(PORT, HOST, () => {
  console.log("Bacus Dev Foundation");
  console.log(`Listening on ${HOST}:${PORT}`);
});
