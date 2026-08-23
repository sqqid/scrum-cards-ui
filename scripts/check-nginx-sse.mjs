// Nginx SSE streaming verification script.
//
// Boots the real nginx (NGINX_BIN env, defaults to `nginx` on PATH) with the
// repo's nginx/nginx.conf server block, proxied to a mock SSE backend on port
// 8080, and checks that:
//   1. proxy buffering and caching are disabled for the /api location
//   2. an explicit long read timeout is set for the SSE path
//   3. no WebSocket upgrade header handling remains in the configuration
//   4. SSE events arrive in real time through nginx (no batching or delay)
//
// The repo config is a bare server block (included by the Debian nginx layout
// in the production image), so the test wraps it in a minimal nginx.conf and
// rewrites `listen 80` to an unprivileged test port. Everything else is used
// verbatim.
//
// The idle scenario waits ~70s: with nginx's default 60s proxy_read_timeout a
// silent SSE connection is closed, so the connection must survive that window
// to prove the explicit long read timeout is in effect.
//
// Usage: node scripts/check-nginx-sse.mjs
//   NGINX_BIN=/path/to/nginx node scripts/check-nginx-sse.mjs

import { spawn, spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import http from "node:http";
import net from "node:net";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NGINX_BIN = process.env.NGINX_BIN || "nginx";
const BACKEND_PORT = 8080; // nginx.conf proxies /api to localhost:8080
const NGINX_TEST_PORT = 18080;
const SSE_PATH = "/api/room1/clients/client1/event/";
const IDLE_SURVIVAL_MS = 70_000; // must outlive the default 60s read timeout
const MAX_EVENT_DELAY_MS = 1000;

function checkNginxBinary() {
  const result = spawnSync(NGINX_BIN, ["-v"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `cannot run nginx binary ${JSON.stringify(NGINX_BIN)}. ` +
        `Install nginx or point NGINX_BIN at a binary.`
    );
  }
}

function waitForPort(port, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const sock = net.connect(port, "127.0.0.1");
      sock.once("connect", () => {
        sock.destroy();
        resolve();
      });
      sock.once("error", () => {
        sock.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`port ${port} not ready after ${timeoutMs}ms`));
        } else {
          setTimeout(attempt, 50);
        }
      });
    };
    attempt();
  });
}

// Mock of the Go backend's SSE endpoint: text/event-stream, one `data:` frame
// per event. In "realtime" mode it emits three events spaced 1.5s apart; in
// "idle" mode it emits one event and then goes silent (no heartbeat), so the
// only thing that can keep the connection alive is the nginx read timeout.
function startMockSseBackend(mode) {
  const sent = [];
  const server = http.createServer((req, res) => {
    if (!req.url.startsWith("/api/") || !req.url.endsWith("/event/")) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end('{"message":"not found"}');
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    const send = (name) => {
      sent.push({ name, at: Date.now() });
      res.write(`data: ${name}\n\n`);
    };
    send("event-1");
    if (mode === "realtime") {
      setTimeout(() => send("event-2"), 1500);
      setTimeout(() => send("event-3"), 3000);
    }
  });
  return new Promise((resolve, reject) => {
    server.once("error", (err) =>
      reject(new Error(`mock backend failed to listen on ${BACKEND_PORT}: ${err.message}`))
    );
    server.listen(BACKEND_PORT, () => resolve({ server, sent }));
  });
}

async function stopMockSseBackend(backend) {
  backend.server.closeAllConnections();
  await new Promise((resolve) => backend.server.close(resolve));
}

// Builds a full nginx.conf around the repo's bare server block, rewriting only
// the listen port (80 needs root). Returns { dir, wrapperPath }.
async function buildNginxConfig() {
  const dir = await mkdtemp(path.join(tmpdir(), "scrum-cards-nginx-"));
  const repoConf = await readFile(path.join(repoRoot, "nginx", "nginx.conf"), "utf8");
  const serverConf = repoConf.replace("listen 80;", `listen ${NGINX_TEST_PORT};`);
  if (serverConf.includes("listen 80;")) {
    throw new Error("nginx/nginx.conf no longer contains `listen 80;` — update the test");
  }
  const serverPath = path.join(dir, "server.conf");
  await writeFile(serverPath, serverConf);
  for (const name of ["client", "proxy", "fastcgi", "uwsgi", "scgi"]) {
    await mkdir(path.join(dir, "tmp", name), { recursive: true });
  }
  const wrapperPath = path.join(dir, "nginx.conf");
  await writeFile(
    wrapperPath,
    [
      "worker_processes 1;",
      `pid ${path.join(dir, "nginx.pid")};`,
      `error_log ${path.join(dir, "error.log")} warn;`,
      "events {}",
      "http {",
      "  access_log off;",
      `  client_body_temp_path ${path.join(dir, "tmp", "client")};`,
      `  proxy_temp_path ${path.join(dir, "tmp", "proxy")};`,
      `  fastcgi_temp_path ${path.join(dir, "tmp", "fastcgi")};`,
      `  uwsgi_temp_path ${path.join(dir, "tmp", "uwsgi")};`,
      `  scgi_temp_path ${path.join(dir, "tmp", "scgi")};`,
      `  include ${serverPath};`,
      "}",
      "",
    ].join("\n")
  );
  return { dir, wrapperPath };
}

// A leftover process on the test port would silently serve a stale config, so
// the port must be free before nginx starts.
function requirePortFree(port) {
  return new Promise((resolve, reject) => {
    const sock = net.connect(port, "127.0.0.1");
    sock.once("connect", () => {
      sock.destroy();
      reject(new Error(`port ${port} is already in use — free it before running the test`));
    });
    sock.once("error", () => {
      sock.destroy();
      resolve();
    });
  });
}

async function startNginx(wrapperPath) {
  await requirePortFree(NGINX_TEST_PORT);
  // `daemon off` keeps the spawned process as the master, so signals and the
  // exit event reach the right pid (nginx daemonizes by default and the
  // initial process exits right after forking the master).
  const child = spawn(NGINX_BIN, ["-c", wrapperPath, "-g", "daemon off;"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = { buf: "" };
  child.stderr.on("data", (d) => (output.buf += d));
  child.stdout.on("data", (d) => (output.buf += d));
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(err);
    };
    child.once("error", (err) => fail(new Error(`cannot run ${NGINX_BIN}: ${err.message}`)));
    child.once("exit", (code) =>
      fail(new Error(`nginx exited early with code ${code}:\n${output.buf}`))
    );
    waitForPort(NGINX_TEST_PORT, 5000)
      .then(() => {
        if (settled) return;
        settled = true;
        resolve({
          output: () => output.buf,
          stop: () =>
            new Promise((done) => {
              child.once("exit", () => done());
              child.kill("SIGQUIT");
              setTimeout(() => {
                child.kill("SIGKILL");
                done();
              }, 3000);
            }),
        });
      })
      .catch(fail);
  });
}

// Reads SSE frames from the proxied endpoint until `until` events arrive.
async function openSseStream(base, { until, timeoutMs }) {
  const res = await fetch(base + SSE_PATH, { headers: { Accept: "text/event-stream" } });
  if (res.status !== 200) {
    throw new Error(`expected 200 from ${base}${SSE_PATH}, got ${res.status}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const events = [];
  let buffer = "";
  const deadline = Date.now() + timeoutMs;
  while (events.length < until) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new Error(`timed out after ${timeoutMs}ms with ${events.length}/${until} events`);
    }
    const raced = await Promise.race([
      reader.read().then((r) => ({ r, timedOut: false })),
      new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), remaining)),
    ]);
    if (raced.timedOut) {
      throw new Error(`timed out after ${timeoutMs}ms with ${events.length}/${until} events`);
    }
    if (raced.r.done) {
      throw new Error(
        `SSE connection closed after ${events.length}/${until} events: ` +
          `event-1 at ${events[0]?.at ?? "n/a"}`
      );
    }
    buffer += decoder.decode(raced.r.value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const line = frame.split("\n").find((l) => l.startsWith("data: "));
      if (line) events.push({ data: line.slice(6), at: Date.now() });
    }
  }
  return { events, reader };
}

// Criterion 4: events must flow through nginx as the backend emits them.
async function scenarioRealtime() {
  const backend = await startMockSseBackend("realtime");
  const nginx = await startNginx(wrapperPath);
  try {
    const { events } = await openSseStream(`http://127.0.0.1:${NGINX_TEST_PORT}`, {
      until: 3,
      timeoutMs: 10_000,
    });
    for (const ev of events) {
      const sentAt = backend.sent.find((s) => s.name === ev.data)?.at;
      assert.ok(sentAt !== undefined, `backend never sent ${ev.data}`);
      const delay = ev.at - sentAt;
      assert.ok(
        delay < MAX_EVENT_DELAY_MS,
        `event ${ev.data} delayed ${delay}ms through nginx — SSE is not streaming in real time`
      );
    }
  } finally {
    await nginx.stop();
    await stopMockSseBackend(backend);
  }
}

// Criterion 2: a silent SSE connection must survive past the default 60s
// proxy_read_timeout, proving the explicit long read timeout is in effect.
async function scenarioIdle() {
  const backend = await startMockSseBackend("idle");
  const nginx = await startNginx(wrapperPath);
  const startedAt = Date.now();
  try {
    const { reader } = await openSseStream(`http://127.0.0.1:${NGINX_TEST_PORT}`, {
      until: 1,
      timeoutMs: 10_000,
    });
    const deadline = Date.now() + IDLE_SURVIVAL_MS;
    let closed = null;
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const raced = await Promise.race([
        reader
          .read()
          .then((r) => ({ r, timedOut: false, err: null }))
          .catch((err) => ({ r: null, timedOut: false, err })),
        new Promise((resolve) => setTimeout(() => resolve({ timedOut: true }), remaining)),
      ]);
      if (raced.timedOut) break;
      if (raced.r?.done || raced.err) {
        closed = raced.err ? raced.err.message : "EOF";
        break;
      }
    }
    if (closed) {
      throw new Error(
        `SSE connection was closed after ${Date.now() - startedAt}ms of idle (${closed}) — ` +
          `the read timeout is not long enough (must outlive the default 60s)`
      );
    }
    await reader.cancel().catch(() => {});
  } finally {
    await nginx.stop();
    await stopMockSseBackend(backend);
  }
}

function extractLocations(config) {
  const locations = [];
  const re = /location\s+([^{]+)\{/g;
  let m;
  while ((m = re.exec(config)) !== null) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < config.length && depth > 0) {
      if (config[i] === "{") depth++;
      else if (config[i] === "}") depth--;
      i++;
    }
    locations.push({ modifier: m[1].trim(), body: config.slice(start, i - 1) });
  }
  return locations;
}

function toSeconds(value, unit) {
  const n = Number(value);
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 3600;
  return n;
}

// Criteria 1-3: the effective configuration (as nginx itself parses it) must
// disable buffering/caching for /api, set a long read timeout for the SSE
// path, and contain no WebSocket upgrade header handling.
async function scenarioConfig() {
  const result = spawnSync(NGINX_BIN, ["-T", "-c", wrapperPath], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`nginx -T failed:\n${result.stderr}`);
  }
  const effective = result.stdout;
  const locations = extractLocations(effective);
  const api = locations.find((l) => l.modifier === "/api");
  assert.ok(api, "no /api location in the effective nginx configuration");
  assert.match(
    api.body,
    /proxy_buffering\s+off/,
    "proxy buffering is not disabled for the /api location"
  );
  assert.match(
    api.body,
    /proxy_cache\s+off/,
    "proxy caching is not disabled for the /api location"
  );
  const timeout = api.body.match(/proxy_read_timeout\s+(\d+)([smh])?/);
  assert.ok(timeout, "no explicit proxy_read_timeout set for the /api (SSE) path");
  const seconds = toSeconds(timeout[1], timeout[2]);
  assert.ok(
    seconds >= 120,
    `proxy_read_timeout of ${seconds}s is not long (must be >= 120s to outlive the 60s default)`
  );
  assert.ok(
    !/\$http_upgrade/.test(effective),
    "WebSocket upgrade handling ($http_upgrade) remains in the configuration"
  );
  assert.ok(
    !/proxy_set_header\s+Upgrade/i.test(effective),
    "WebSocket Upgrade header handling remains in the configuration"
  );
  assert.ok(
    !/proxy_set_header\s+Connection/i.test(effective),
    "WebSocket Connection header handling remains in the configuration"
  );
}

checkNginxBinary();
const { dir: confDir, wrapperPath } = await buildNginxConfig();

const results = [];
try {
  for (const [name, fn] of [
    ["config", scenarioConfig],
    ["realtime", scenarioRealtime],
    ["idle-70s", scenarioIdle],
  ]) {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`PASS ${name}`);
    } catch (err) {
      results.push({ name, ok: false });
      console.log(`FAIL ${name}\n${err.message}`);
    }
  }
} finally {
  await rm(confDir, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} of ${results.length} scenarios failed`);
  process.exit(1);
}
console.log("\nall scenarios passed");
