#!/usr/bin/env node
"use strict";

// Local dev server: rebuilds the site whenever a source file changes and
// serves dist/ over HTTP, so you don't have to run `node build.js` by hand
// after every edit. This is local-only -- GitHub Actions runs build.js
// directly for the real deploy (see .github/workflows/deploy.yml).
//
// Usage: node dev.js [port]   (defaults to port 8080)

const fs = require("fs");
const path = require("path");
const http = require("http");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.argv[2]) || 8080;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function build() {
  try {
    execFileSync("node", [path.join(ROOT, "build.js")], { stdio: "inherit" });
  } catch (err) {
    console.error("build failed:", err.message);
  }
}

let pending = false;
function scheduleBuild() {
  if (pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    build();
  }, 100);
}

function resolveFilePath(url) {
  const decoded = decodeURIComponent(url.split("?")[0]);
  const relative = decoded.endsWith("/") ? decoded + "index.html" : decoded;
  const resolved = path.normalize(path.join(DIST, relative));
  return resolved.startsWith(DIST) ? resolved : null;
}

build();

fs.watch(path.join(ROOT, "src"), { recursive: true }, scheduleBuild);
fs.watch(path.join(ROOT, "assets"), { recursive: true }, scheduleBuild);

http
  .createServer((req, res) => {
    const filePath = resolveFilePath(req.url);

    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}`);
    console.log("Watching src/ and assets/ for changes...");
  });
