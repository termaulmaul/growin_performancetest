// Default mock runner entry (BP001 PT_Dev). Prefer gen-mock-runner.mjs for other scenarios.
import { BP001, buildThresholds } from '/workspace/Script/Growin_PT_Dev[ToDo]/Web/BP001.js';
import { resolveVuCount, clampLocalVuCount } from '/workspace/docker-local-pt/scripts/k6-env-utils.js';

const BASE_URL = __ENV.BASE_URL || 'http://mock-api:8080';
let BP_CONFIG = null;
try {
  BP_CONFIG = JSON.parse(__ENV.BP_CONFIG || '');
} catch (e) {
  throw new Error('BP_CONFIG must be valid JSON. Render YAML via yaml-to-json.mjs.');
}

const vus = clampLocalVuCount(resolveVuCount());

export const options = {
  vus,
  duration: __ENV.DURATION || '30s',
  thresholds: buildThresholds(BP_CONFIG),
  setupTimeout: '120s',
  teardownTimeout: '60s',
};

export function setup() {
  const total = options.vus;
  const vuMapping = {};
  const tokens = {};
  for (let i = 1; i <= total; i++) {
    const userKey = 'local-' + i;
    vuMapping[i] = { userKey, credentials: { email: userKey + '@example.test', password: 'mock' } };
    tokens[userKey] = { token: 'mock-token-' + i, pin_token: 'mock-pin-' + i, email: userKey + '@example.test' };
  }
  return { base_url: BASE_URL, tokens, vuMapping, BP_CONFIG };
}

export default function (data) {
  return BP001(data);
}

function safeNum(o, path, def) {
  try {
    for (const k of path) {
      o = o[k];
      if (o == null) return def;
    }
    return o == null ? def : o;
  } catch (e) {
    return def;
  }
}

export function handleSummary(data) {
  const stamp = __ENV.MOCK_RESULT_BASENAME || 'summary';
  const out = {
    mode: 'LOCAL_DOCKER_MOCK',
    suite: 'Growin_PT_Dev[ToDo]',
    scenario: 'BP001',
    platform: 'Web',
    variant: 'original',
    base_url: BASE_URL,
    iterations: safeNum(data, ['metrics', 'iterations', 'values', 'count'], 0),
    http_reqs: safeNum(data, ['metrics', 'http_reqs', 'values', 'count'], 0),
    http_req_duration_p95: safeNum(data, ['metrics', 'http_req_duration', 'values', 'p(95)'], 0),
    timestamp: new Date().toISOString(),
  };
  return {
    stdout: JSON.stringify(out, null, 2) + '\n',
    [`/results/${stamp}.json`]: JSON.stringify(out, null, 2),
    '/results/summary.json': JSON.stringify(out, null, 2),
  };
}
