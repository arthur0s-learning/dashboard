const http = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);
const files = {
  "/": { name: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { name: "index.html", type: "text/html; charset=utf-8" },
  "/data.json": { name: "data.json", type: "application/json; charset=utf-8" },
  "/data.js": { name: "data.js", type: "text/javascript; charset=utf-8" },
};

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed");
    return;
  }

  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const file = files[pathname];
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  try {
    const body = await readFile(path.join(root, file.name));
    response.writeHead(200, {
      "Content-Type": file.type,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    console.error(`Could not read ${file.name}:`, error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Could not load dashboard file");
  }
});

server.listen(port, host, () => {
  console.log(`Dashboard ready at http://${host}:${port}`);
});