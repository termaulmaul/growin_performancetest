// Sandbox_Demo.js — Smoke test untuk Sandbox stack demonstration
// Run via pt-menu.sh → Sandbox Demo → Sandbox_Demo
// k6 di pt-sandbox-ssh container, HTTP ke pt-mock-api:8080
//
// Real Growin scripts NOT meant to run here — they need real Growin
// backend (Onprem/Oncloud). Sandbox is for FRAMEWORK validation only.

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics — mirrors real Growin script naming convention
const duration_login    = new Trend('duration_BP001_01_login', true);
const error_rate_login  = new Rate('error_rate_BP001_01_login');
const sample_login      = new Counter('sample_BP001_01_login');

const duration_userid   = new Trend('duration_BP001_02_userid', true);
const error_rate_userid = new Rate('error_rate_BP001_02_userid');
const sample_userid     = new Counter('sample_BP001_02_userid');

const duration_health   = new Trend('duration_BP001_03_health', true);
const error_rate_health = new Rate('error_rate_BP001_03_health');
const sample_health     = new Counter('sample_BP001_03_health');

const BASE_URL = __ENV.BASE_URL || 'http://mock-api:8080';
const VUS      = parseInt(__ENV.K6_USERS || __ENV.USER || '5');
const DURATION = __ENV.DURATION || '30s';

export const options = {
  scenarios: {
    BP001: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
      exec: 'BP001',
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed':   ['rate<0.01'],
  },
};

export function setup() {
  console.log(`🎯 Sandbox Demo — Target: ${BASE_URL}`);
  console.log(`🎯 VUs: ${VUS} · Duration: ${DURATION}`);
  console.log(`🎯 Scenario: BP001 (login → userid → health)`);
  return { baseUrl: BASE_URL };
}

export function BP001(data) {
  const baseUrl = data.baseUrl;
  const headers = { 'Content-Type': 'application/json' };

  // Step 1: Login
  group('BP001_01_login', () => {
    const t0 = Date.now();
    const res = http.post(
      `${baseUrl}/auth/api/v1/login`,
      JSON.stringify({ email: `user${__VU}@demo.com`, password: 'demo' }),
      { headers }
    );
    duration_login.add(Date.now() - t0);
    const ok = check(res, {
      'login status 200':  (r) => r.status === 200,
      'login has token':   (r) => r.json('data.token') !== undefined,
    });
    error_rate_login.add(!ok);
    sample_login.add(1);
  });

  sleep(0.5);

  // Step 2: Get user ID
  group('BP001_02_userid', () => {
    const t0 = Date.now();
    const res = http.get(`${baseUrl}/auth/api/v1/identity/userid`, { headers });
    duration_userid.add(Date.now() - t0);
    const ok = check(res, {
      'userid status 200': (r) => r.status === 200,
      'userid has data':   (r) => r.json('data.userId') !== undefined,
    });
    error_rate_userid.add(!ok);
    sample_userid.add(1);
  });

  sleep(0.5);

  // Step 3: Health check
  group('BP001_03_health', () => {
    const t0 = Date.now();
    const res = http.get(`${baseUrl}/health`, { headers });
    duration_health.add(Date.now() - t0);
    const ok = check(res, {
      'health status 200': (r) => r.status === 200,
      'health ok':         (r) => r.json('ok') === true,
    });
    error_rate_health.add(!ok);
    sample_health.add(1);
  });

  sleep(1);
}

export default BP001;
