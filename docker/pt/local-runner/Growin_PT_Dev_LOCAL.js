// Local-only wrapper runner. Bypasses real auth + forces base_url to mock-api.
// Use ONLY for local mock-mode validation. Do NOT use in INT/QA/DRC.
//
// Run via: docker compose -f docker/pt/docker-compose.pt.yml --profile mock up

import http from 'k6/http';
import { sleep } from 'k6';
import { BP001, buildThresholds } from '../../../Script/Growin_PT_Dev[ToDo]/Web/BP001.js';

const BASE_URL = __ENV.BASE_URL || 'http://mock-api:8088';

let BP_CONFIG = null;
try {
  BP_CONFIG = JSON.parse(`${__ENV.BP_CONFIG}`);
} catch (e) {
  throw new Error('BP_CONFIG must be valid JSON; set BP_CONFIG via run-k6-local.sh (BP_CONFIG_FILE pre-rendered).');
}

export const options = {
  vus: parseInt(__ENV.USER || '1'),
  duration: __ENV.DURATION || '30s',
  thresholds: buildThresholds(BP_CONFIG),
  setupTimeout: '60s',
  teardownTimeout: '60s',
};

export function setup() {
  // Bypass login. Tokens are placeholder; mock-api accepts anything.
  const vuMapping = {};
  const total = options.vus;
  for (let i = 1; i <= total; i++) {
    vuMapping[i] = {
      userKey: 'local-' + i,
      credentials: { email: 'local' + i + '@example.test', password: 'mock' },
      token: 'mock-token-' + i,
      pinToken: 'mock-pin-' + i,
    };
  }
  return { base_url: BASE_URL, tokens: {}, vuMapping };
}

export { BP001 };

export function handleSummary(data) {
  return { stdout: JSON.stringify({ metrics: Object.keys(data.metrics).length, runMode: 'LOCAL_MOCK', base_url: BASE_URL }) + '\n' };
}
