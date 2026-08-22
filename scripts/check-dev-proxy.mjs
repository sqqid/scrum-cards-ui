// Verification script for ISSUE-021 (dev proxy /api to the backend).
//
// Boots the real Vite dev server against a mock backend and checks the
// acceptance criteria:
//   1. /api requests are proxied to the backend with the /api prefix preserved
//   2. the proxy target defaults to the backend on port 8080, and the
//      VITE_API_URL env override still works
//   3. no debug console logging remains in the proxy configuration
//   4. dev works with zero .env configuration
//
// Usage: node scripts/check-dev-proxy.mjs
//
// Each scenario runs in a child process whose cwd is an empty directory, so
// the config's loadEnv(mode, process.cwd(), '') finds no .env files — exactly
// the "zero .env configuration" case. VITE_* variables are stripped from the
// child environment unless the scenario sets them.

import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEV_PORT = 5199;

function startMockBackend(port) {
  const seen = [];
  const server = http.createServer((req, res) => {
    seen.push(req.url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ path: req.url }));
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => resolve({ server, seen }));
  });
}

async function withDevServer(fn) {
  const server = await createServer({
    root: repoRoot,
    configFile: path.join(repoRoot, 'vite.config.js'),
    mode: 'development',
    logLevel: 'silent',
    server: { host: '127.0.0.1', port: DEV_PORT, strictPort: true },
  });
  await server.listen();
  try {
    await fn(`http://127.0.0.1:${DEV_PORT}`);
  } finally {
    await server.close();
  }
}

// Zero .env files, no VITE_API_URL: the proxy must default to the backend on
// port 8080 and preserve the /api prefix.
async function scenarioDefault() {
  const backend = await startMockBackend(8080);
  try {
    await withDevServer(async (base) => {
      const res = await fetch(`${base}/api/rooms/`);
      assert.equal(res.status, 200, `expected 200 from dev proxy, got ${res.status}`);
      const body = await res.json();
      assert.deepEqual(body, { path: '/api/rooms/' });
      assert.deepEqual(backend.seen, ['/api/rooms/']);
    });
  } finally {
    backend.server.close();
  }
}

// VITE_API_URL set: the proxy must target it, still preserving /api.
async function scenarioOverride() {
  const backend = await startMockBackend(8081);
  try {
    await withDevServer(async (base) => {
      const res = await fetch(`${base}/api/rooms/abc123/clients/`);
      assert.equal(res.status, 200, `expected 200 from dev proxy, got ${res.status}`);
      const body = await res.json();
      assert.deepEqual(body, { path: '/api/rooms/abc123/clients/' });
      assert.deepEqual(backend.seen, ['/api/rooms/abc123/clients/']);
    });
  } finally {
    backend.server.close();
  }
}

const scenario = process.argv[2];

if (scenario === 'default' || scenario === 'override') {
  const timer = setTimeout(() => {
    console.error(`scenario ${scenario} timed out after 30s`);
    process.exit(1);
  }, 30000);
  try {
    if (scenario === 'default') {
      await scenarioDefault();
    } else {
      await scenarioOverride();
    }
    console.log(`scenario ${scenario}: ok`);
    clearTimeout(timer);
    process.exit(0);
  } catch (err) {
    console.error(`scenario ${scenario}: FAIL`);
    console.error(err);
    clearTimeout(timer);
    process.exit(1);
  }
}

const emptyDir = await mkdtemp(path.join(tmpdir(), 'scrum-cards-noenv-'));
const results = [];
try {
  for (const [name, extraEnv] of [
    ['default', {}],
    ['override', { VITE_API_URL: 'http://127.0.0.1:8081' }],
  ]) {
    const childEnv = { ...process.env };
    for (const key of Object.keys(childEnv)) {
      if (key.startsWith('VITE_')) delete childEnv[key];
    }
    Object.assign(childEnv, extraEnv);
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), name], {
      cwd: emptyDir,
      env: childEnv,
      encoding: 'utf8',
    });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    const ok = result.status === 0;
    results.push({ name, ok });
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : `\n${output}`}`);
  }
  const source = await readFile(path.join(repoRoot, 'vite.config.js'), 'utf8');
  const ok = !/console\./.test(source);
  results.push({ name: 'no-debug-logging', ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} no-debug-logging`);
} finally {
  await rm(emptyDir, { recursive: true, force: true });
}

const failed = results.filter((r) => !r.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} of ${results.length} scenarios failed`);
  process.exit(1);
}
console.log('\nall scenarios passed');
