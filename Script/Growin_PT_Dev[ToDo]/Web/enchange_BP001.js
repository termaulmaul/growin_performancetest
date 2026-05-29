// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * Dynamic BP Runner - Web/enchange_BP001.js (ENHANCED v2)
 *
 * v1 (vs Web/BP001.js):
 *   - Validasi config (bp_id, apis[], duplicate id, path '/', method whitelist).
 *   - Loader dukung BP_CONFIG + BP_CONFIG_FILE (open()) sesuai header file lama.
 *   - URL builder aman: trim trailing slash base_url, escape regex path_params,
 *     deteksi placeholder belum ter-resolve, query_params support object|array|string.
 *   - http.expectedStatuses() cached -> http_req_failed akurat utk 3xx legit.
 *   - Body serialization sadar Content-Type.
 *   - Metrik konsisten: duration/waiting/error_rate/error_count/sample per API.
 *   - Threshold sample_* pakai min_samples (default 1); min_rps tetap di handleSummary.
 *   - check() selalu dijalankan dgn tag (bp_id, api_id, endpoint, method, name).
 *   - Logging error body request/response di-truncate (MAX_LOG_BODY_CHARS).
 *   - DEBUG flag eksplisit menggantikan ENV != 'INT'.
 *   - Think time randomized (think_time_seconds.min/max).
 *
 * v2 IMPROVEMENTS:
 *   - Per-API precompute (apiPlan): method, tag, staticTags, expectedStatuses, responseCallback,
 *     formattedExpected. Hilang overhead per request (normalize/format 3x -> 1x init).
 *   - Response chaining via `apiDef.extract: { var: 'json.dot.path' }` -> simpan ke `ctx` per iterasi.
 *   - Template interpolation: `{{vu.id}}`, `{{iter}}`, `{{now}}`, `{{user.email}}`,
 *     `{{user.token}}`, `{{user.pin_token}}`, `{{ctx.<var>}}`. Berlaku di path_params,
 *     query_params (string+obj), payload (deep), headers.
 *   - Retry opsional: `apiDef.retry: { max: 2, backoff_ms: 200, on: [502,503,504,'network'] }`.
 *     Metric baru `retry_count_*` per API. Default max=0 -> no retry (backward compat).
 *   - Correlation ID auto: header `X-Request-Id: PT-{vuId}-{iter}-{apiId}-{rand}` (override-able).
 *   - Default timeout dari `BP_CONFIG.default_timeout` (mis. '30s'). Override per API.
 *   - Response assertion: `apiDef.assert: [{ json_path, equals|contains|not_null }]`.
 *     Status 200 tapi body fail -> counted error + metric `assert_fail_*`.
 *   - Structured JSON logs via `__ENV.LOG_FORMAT=json`.
 *   - Per-iteration tag opt-in: `BP_CONFIG.tags_include_iter: true` (default false; cegah cardinality blow-up).
 *
 * Jenkins call (tidak berubah):
 *   k6 run ... -e BP_CONFIG='{"bp_id":"BP001","apis":[...],...}'
 *   k6 run ... -e BP_CONFIG_FILE=./configs/BP001.json
 *
 * Optional env:
 *   -e DEBUG=true           # log per success
 *   -e LOG_FORMAT=json      # structured error logs
 *   -e MAX_LOG_BODY_CHARS=N # truncate (default 1000)
 */

import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import http from 'k6/http';
import exec from 'k6/execution';

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const SUPPORTED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
const DEFAULT_THRESHOLDS = {
  avg_response_time_ms: 200,
  error_rate_percent: 0.1,
  min_samples: 1,
};
const DEFAULT_EXPECTED_STATUSES = [{ min: 200, max: 399 }];
const MAX_LOG_BODY_CHARS = Number(__ENV.MAX_LOG_BODY_CHARS || 1000);
const DEBUG = String(__ENV.DEBUG || '').toLowerCase() === 'true';
const LOG_FORMAT = String(__ENV.LOG_FORMAT || '').toLowerCase();
const STRING_TRUE = new Set(['1', 'true', 'yes', 'y']);
const TEMPLATE_REGEX = /\{\{\s*([a-zA-Z0-9_.|]+)\s*\}\}/g;

// ─── UTIL ──────────────────────────────────────────────────────────────────────
function sanitizeMetricPart(value) {
  const normalized = value !== undefined && value !== null ? value : 'unknown';
  return String(normalized).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 128) || 'unknown';
}

function safeStableName(bpId, apiDef) {
  return `${bpId}/${apiDef.id}/${apiDef.name}`;
}

function metricKey(bpId, apiId) {
  return `${bpId}_${apiId}`;
}

function metricTag(bpId, apiDef) {
  return [bpId, apiDef.id, apiDef.name].map(sanitizeMetricPart).join('_');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return STRING_TRUE.has(String(value).trim().toLowerCase());
}

function truncate(value, maxChars = MAX_LOG_BODY_CHARS) {
  if (value === undefined || value === null) return '';
  const text = String(value);
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}...[truncated ${text.length - maxChars} chars]`;
}

function getByPath(obj, path) {
  if (obj === null || obj === undefined || !path) return undefined;
  return String(path).split('.').reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

function randomSuffix(len = 6) {
  return Math.random().toString(36).slice(2, 2 + len);
}

// ─── CONFIG LOADER ─────────────────────────────────────────────────────────────
function loadConfig() {
  let raw = null;

  // ENHANCE: Support BP_CONFIG_FILE promised by original header while keeping BP_CONFIG env contract.
  if (__ENV.BP_CONFIG_FILE && __ENV.BP_CONFIG_FILE !== 'undefined') {
    raw = open(__ENV.BP_CONFIG_FILE);
  } else if (__ENV.BP_CONFIG && __ENV.BP_CONFIG !== 'undefined') {
    raw = __ENV.BP_CONFIG;
  }

  if (!raw || !String(raw).trim()) {
    throw new Error('BP_CONFIG or BP_CONFIG_FILE must be provided.');
  }

  const parsed = JSON.parse(raw);
  validateConfig(parsed);
  return parsed;
}

function validateConfig(config) {
  // ENHANCE: Fail fast in init context so Jenkins sees config/schema error before VU traffic starts.
  if (!config || typeof config !== 'object') throw new Error('config must be an object.');
  if (!config.bp_id) throw new Error('config.bp_id is required.');
  if (!Array.isArray(config.apis) || config.apis.length === 0) {
    throw new Error('config.apis must be a non-empty array.');
  }

  const ids = new Set();
  config.apis.forEach((api, index) => {
    const prefix = `apis[${index}]`;

    if (!api || typeof api !== 'object') throw new Error(`${prefix} must be an object.`);
    if (api.id === undefined || api.id === null || api.id === '') {
      throw new Error(`${prefix}.id is required.`);
    }
    if (ids.has(String(api.id))) throw new Error(`duplicate api.id found: ${api.id}`);
    ids.add(String(api.id));

    if (!api.name) throw new Error(`${prefix}.name is required.`);
    if (!api.path || typeof api.path !== 'string' || !api.path.startsWith('/')) {
      throw new Error(`${prefix}.path must be a string starting with '/'.`);
    }

    const method = String(api.method || 'GET').toUpperCase();
    if (!SUPPORTED_METHODS.has(method)) {
      throw new Error(`${prefix}.method '${method}' is unsupported.`);
    }
  });
}

const BP_CONFIG = loadConfig();
const TAGS_INCLUDE_ITER = toBoolean(BP_CONFIG.tags_include_iter, false);
const DEFAULT_TIMEOUT = BP_CONFIG.default_timeout || null;

// ─── EXPECTED STATUS ───────────────────────────────────────────────────────────
const responseCallbackRegistry = {};

function normalizeExpectedStatuses(value) {
  const raw = value === undefined || value === null ? DEFAULT_EXPECTED_STATUSES : value;
  const items = Array.isArray(raw) ? raw : [raw];

  return items.map((item) => {
    if (typeof item === 'number') return item;
    if (item && typeof item === 'object'
        && Number.isFinite(Number(item.min))
        && Number.isFinite(Number(item.max))) {
      return { min: Number(item.min), max: Number(item.max) };
    }
    throw new Error(`invalid expected status definition: ${JSON.stringify(item)}`);
  });
}

function getResponseCallback(normalized) {
  const key = JSON.stringify(normalized);
  if (!responseCallbackRegistry[key]) {
    responseCallbackRegistry[key] = http.expectedStatuses(...normalized);
  }
  return responseCallbackRegistry[key];
}

function isExpectedStatus(status, normalized) {
  return normalized.some((expected) => {
    if (typeof expected === 'number') return status === expected;
    return status >= expected.min && status <= expected.max;
  });
}

function formatExpectedStatuses(normalized) {
  return normalized
    .map((e) => (typeof e === 'number' ? String(e) : `${e.min}-${e.max}`))
    .join(',');
}

// ─── API PLAN (precompute per apiDef, init time) ───────────────────────────────
function buildApiPlan(config) {
  return config.apis.map((apiDef) => {
    const method = String(apiDef.method || 'GET').toUpperCase();
    const expectedSource = apiDef.expected_statuses !== undefined && apiDef.expected_statuses !== null
      ? apiDef.expected_statuses
      : apiDef.expected_status;
    const expected = normalizeExpectedStatuses(expectedSource);
    const tag = metricTag(config.bp_id, apiDef);
    const staticTags = {
      bp_id: String(config.bp_id),
      api_id: String(apiDef.id),
      endpoint: sanitizeMetricPart(apiDef.name),
      method,
      name: safeStableName(config.bp_id, apiDef),
    };
    return {
      apiDef,
      method,
      tag,
      staticTags,
      expectedStatuses: expected,
      formattedExpected: formatExpectedStatuses(expected),
      responseCallback: getResponseCallback(expected),
    };
  });
}

const API_PLAN = buildApiPlan(BP_CONFIG);

// ─── METRIC REGISTRY (init context only) ───────────────────────────────────────
function buildMetricRegistry(plan) {
  const registry = {};
  plan.forEach((p) => {
    registry[metricKey(BP_CONFIG.bp_id, p.apiDef.id)] = {
      tag: p.tag,
      // ENHANCE: Keep metric name schema stable for existing Grafana dashboards and handleSummary.
      duration: new Trend(`duration_${p.tag}`),
      waiting: new Trend(`waiting_${p.tag}`),
      errorRate: new Rate(`error_rate_${p.tag}`),
      errorCount: new Counter(`error_count_${p.tag}`),
      sampleCount: new Counter(`sample_${p.tag}`),
      retryCount: new Counter(`retry_count_${p.tag}`),
      assertFail: new Counter(`assert_fail_${p.tag}`),
    };
  });
  return registry;
}

const metricRegistry = buildMetricRegistry(API_PLAN);

function getMetrics(apiId) {
  return metricRegistry[metricKey(BP_CONFIG.bp_id, apiId)] || null;
}

// ─── THRESHOLD BUILDER ─────────────────────────────────────────────────────────
export function buildThresholds(config = BP_CONFIG) {
  if (!config || !Array.isArray(config.apis)) return {};

  const thresholdConfig = Object.assign({}, DEFAULT_THRESHOLDS, config.thresholds || {});
  const avgRespTime = Number(thresholdConfig.avg_response_time_ms);
  const errorRate = Number(thresholdConfig.error_rate_percent) / 100;
  const minSamples = Number(thresholdConfig.min_samples || 1);

  const thresholds = {};
  config.apis.forEach((apiDef) => {
    const tag = metricTag(config.bp_id, apiDef);
    // ENHANCE: Preserve buildThresholds(config) signature used by Growin_PT_Dev.js.
    thresholds[`duration_${tag}`] = [{ threshold: `p(95)<${avgRespTime}`, abortOnFail: false }];
    thresholds[`error_rate_${tag}`] = [{ threshold: `rate<${errorRate}`, abortOnFail: false }];
    thresholds[`sample_${tag}`] = [{ threshold: `count>=${minSamples}`, abortOnFail: false }];
  });
  return thresholds;
}

// ─── TEMPLATE INTERPOLATION ────────────────────────────────────────────────────
function interpolateString(str, scope) {
  if (typeof str !== 'string') return str;
  if (str.indexOf('{{') < 0) return str;
  return str.replace(TEMPLATE_REGEX, (match, expr) => {
    // ENHANCE: Allow simple fallback chain like {{ctx.id|user.key}} without making config mandatory.
    const val = String(expr).split('|').reduce((found, candidate) => {
      if (found !== undefined && found !== null) return found;
      return getByPath(scope, candidate);
    }, undefined);
    return val === undefined || val === null ? match : String(val);
  });
}

function deepInterpolate(value, scope) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return interpolateString(value, scope);
  if (Array.isArray(value)) return value.map((v) => deepInterpolate(v, scope));
  if (typeof value === 'object') {
    const out = {};
    Object.keys(value).forEach((k) => { out[k] = deepInterpolate(value[k], scope); });
    return out;
  }
  return value;
}

// ─── URL + QUERY BUILDER ───────────────────────────────────────────────────────
function buildQueryString(queryParams) {
  if (queryParams === undefined || queryParams === null || queryParams === '') return '';

  if (typeof queryParams === 'string') {
    return queryParams.replace(/^\?+/, '');
  }
  if (typeof queryParams !== 'object') return '';

  const pairs = [];
  Object.entries(queryParams).forEach(([key, value]) => {
    // ENHANCE: Skip null/undefined query params to avoid sending "null" as literal value.
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
        }
      });
      return;
    }
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });
  return pairs.join('&');
}

function buildUrl(baseUrl, apiDef, scope) {
  // ENHANCE: Trim trailing slash so base_url + path never creates accidental double slash.
  const base = String(baseUrl || '').replace(/\/+$/, '');
  if (!base) throw new Error('data.base_url is required.');

  let path = interpolateString(String(apiDef.path), scope);

  const pathParams = apiDef.path_params && typeof apiDef.path_params === 'object'
    ? deepInterpolate(apiDef.path_params, scope)
    : null;

  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      const encoded = encodeURIComponent(String(value));
      path = path.replace(new RegExp(`\\{${escapeRegExp(key)}\\}`, 'g'), encoded);
    });
  }

  const unresolved = path.match(/\{[^}]+\}/g);
  // ENHANCE: Detect unresolved placeholders instead of silently hitting wrong endpoint.
  if (unresolved) throw new Error(`unresolved path params: ${unresolved.join(', ')}`);

  const query = typeof apiDef.query_params === 'object' && apiDef.query_params !== null
    ? deepInterpolate(apiDef.query_params, scope)
    : interpolateString(apiDef.query_params, scope);

  const queryString = buildQueryString(query);
  return `${base}${path}${queryString ? `?${queryString}` : ''}`;
}

// ─── HEADERS / PARAMS / DISPATCH ──────────────────────────────────────────────
function buildHeaders(userToken, vuId, apiDef, scope, correlationId) {
  const baseHeaders = {
    Cookie: `ACCESS_TOKEN=${userToken.token}; PIN_ACCESS_TOKEN=${userToken.pin_token}`,
    'Content-Type': 'application/json',
    Accept: '*/*',
    'Accept-Language': 'en',
    Connection: 'keep-alive',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': BP_CONFIG.user_agent || 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
    'X-App-Name': apiDef.app_name || BP_CONFIG.app_name || 'web',
    'X-App-Version': apiDef.app_version || BP_CONFIG.app_version || '1.4.1',
    'X-Device-Info': apiDef.device_info || BP_CONFIG.device_info || 'iPhone 11',
    'X-Device-Id': apiDef.device_id || BP_CONFIG.device_id || `PT-VU-${vuId}`,
    'X-Request-Id': correlationId,
  };

  const merged = Object.assign({}, baseHeaders, BP_CONFIG.headers || {}, apiDef.headers || {});

  return deepInterpolate(merged, scope);
}

function serializeBody(payload, headers) {
  if (payload === undefined || payload === null) return null;
  // ENHANCE: Do not stringify already-string payloads; prevents double-encoded JSON.
  if (typeof payload === 'string') return payload;

  const contentType = String(headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
  if (!contentType || contentType.includes('application/json')) {
    return JSON.stringify(payload);
  }
  return String(payload);
}

function buildRequestTags(plan, iter) {
  // ENHANCE: Keep tags low-cardinality by default; iteration tag only when explicitly enabled.
  if (!TAGS_INCLUDE_ITER) return plan.staticTags;
  return Object.assign({}, plan.staticTags, { iter: String(iter) });
}

function buildParams(headers, plan, iter) {
  const apiDef = plan.apiDef;
  const params = {
    headers,
    tags: buildRequestTags(plan, iter),
    responseCallback: plan.responseCallback,
  };

  const timeout = apiDef.timeout || DEFAULT_TIMEOUT;
  if (timeout) params.timeout = timeout;
  if (apiDef.redirects !== undefined && apiDef.redirects !== null) {
    params.redirects = Number(apiDef.redirects);
  }
  if (toBoolean(apiDef.discard_response_body, false)) params.responseType = 'none';
  if (apiDef.cookies && typeof apiDef.cookies === 'object') params.cookies = apiDef.cookies;
  return params;
}

function dispatchRequest(method, url, body, params) {
  switch (method) {
    case 'GET': return http.get(url, params);
    case 'POST': return http.post(url, body, params);
    case 'PUT': return http.put(url, body, params);
    case 'PATCH': return http.patch(url, body, params);
    case 'DELETE': return http.del(url, body, params);
    default: throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// ─── RETRY ────────────────────────────────────────────────────────────────────
function shouldRetry(retryOn, statusOrTag) {
  if (!retryOn || retryOn.size === 0) return true;
  return retryOn.has(String(statusOrTag));
}

function executeWithRetry(plan, method, url, body, params, metrics) {
  // ENHANCE: Retry is opt-in per API; default remains one attempt for backward compatibility.
  const retryConf = plan.apiDef.retry || {};
  const maxAttempts = Math.max(1, Number(retryConf.max || 0) + 1);
  const backoffMs = Math.max(0, Number(retryConf.backoff_ms || 0));
  const retryOn = new Set((retryConf.on || []).map(String));

  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const response = dispatchRequest(method, url, body, params);

      if (!response) {
        if (attempt < maxAttempts && shouldRetry(retryOn, 'network')) {
          if (metrics) metrics.retryCount.add(1);
          if (backoffMs > 0) sleep(backoffMs / 1000);
          continue;
        }
        return { response: null, attempts: attempt };
      }

      if (attempt < maxAttempts && retryOn.has(String(response.status))) {
        if (metrics) metrics.retryCount.add(1);
        if (backoffMs > 0) sleep(backoffMs / 1000);
        continue;
      }

      return { response, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && shouldRetry(retryOn, 'network')) {
        if (metrics) metrics.retryCount.add(1);
        if (backoffMs > 0) sleep(backoffMs / 1000);
        continue;
      }
      throw err;
    }
  }

  if (lastError) throw lastError;
  return { response: null, attempts: attempt };
}

// ─── EXTRACT + ASSERT ─────────────────────────────────────────────────────────
function tryParseJson(response) {
  try { return response.json(); } catch (_) { return undefined; }
}

function applyExtract(response, extractDef, ctx) {
  if (!extractDef || typeof extractDef !== 'object') return;
  const body = tryParseJson(response);
  Object.entries(extractDef).forEach(([varName, path]) => {
    ctx[varName] = getByPath(body, path);
  });
}

function evaluateAssertions(response, assertDef) {
  if (!assertDef) return { ok: true };
  const list = Array.isArray(assertDef) ? assertDef : [assertDef];
  let body = null;
  let bodyParsed = false;

  for (const a of list) {
    if (!a || typeof a !== 'object') continue;

    if (a.json_path && !bodyParsed) {
      body = tryParseJson(response);
      bodyParsed = true;
    }

    const actual = a.json_path ? getByPath(body, a.json_path) : response.body;
    const label = a.json_path || '<body>';

    if (a.equals !== undefined && actual !== a.equals) {
      return { ok: false, reason: `assert.equals fail at ${label}: ${JSON.stringify(actual)} != ${JSON.stringify(a.equals)}` };
    }
    const actualText = actual !== undefined && actual !== null ? actual : '';
    if (a.contains !== undefined && !String(actualText).includes(String(a.contains))) {
      return { ok: false, reason: `assert.contains fail at ${label}: ${JSON.stringify(actual)}` };
    }
    if (a.not_null === true && (actual === undefined || actual === null)) {
      return { ok: false, reason: `assert.not_null fail at ${label}` };
    }
  }
  return { ok: true };
}

// ─── METRIC RECORDERS ──────────────────────────────────────────────────────────
function recordNoResponse(metrics) {
  if (!metrics) return;
  // ENHANCE: Request build/network failure still increments sample/error metrics for dashboard truth.
  metrics.sampleCount.add(1);
  metrics.errorRate.add(true);
  metrics.errorCount.add(1);
}

function recordResponse(metrics, response, isSuccess) {
  if (!metrics) return;
  metrics.duration.add(response.timings.duration);
  metrics.waiting.add(response.timings.waiting);
  metrics.sampleCount.add(1);
  metrics.errorRate.add(!isSuccess);
  if (!isSuccess) metrics.errorCount.add(1);
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getThinkTimeSeconds() {
  const think = BP_CONFIG.think_time_seconds || {};
  const min = Number(think.min !== undefined && think.min !== null ? think.min : 0.1);
  const max = Number(think.max !== undefined && think.max !== null ? think.max : 0.35);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return min > 0 ? min : 0;
  }
  return min + Math.random() * (max - min);
}

function getUserContext(data, vuId) {
  const mapping = (data && data.vuMapping) ? data.vuMapping[vuId] : undefined;
  if (!mapping) return { error: `VU${vuId} - No VU mapping found.` };

  const userKey = mapping.userKey;
  const userToken = (data && data.tokens) ? data.tokens[userKey] : undefined;
  if (!userToken || !userToken.token || !userToken.pin_token) {
    return { error: `VU${vuId} (User ${userKey}) - Invalid token.` };
  }
  return { userKey, userToken };
}

function logError(fields) {
  // ENHANCE: Truncate response body in error logs to avoid heavy stdout I/O under load.
  if (LOG_FORMAT === 'json') {
    console.error(JSON.stringify(fields));
    return;
  }
  const {
    email, method, url, status, body, request_body, reason, request_id, attempts,
  } = fields;
  const statusPart = status !== undefined ? ` | Status: ${status}` : '';
  const bodyPart = body !== undefined ? ` | Body: ${body}` : '';
  const reasonPart = reason ? ` | Reason: ${reason}` : '';
  const attemptsPart = attempts && attempts > 1 ? ` | Attempts: ${attempts}` : '';
  const ridPart = request_id ? ` | RID: ${request_id}` : '';
  console.error(
    `${email} [${method}] ${url}${statusPart}${bodyPart} | RequestBody: ${request_body}${reasonPart}${attemptsPart}${ridPart}`,
  );
}

function buildErrorFields({ email, method, url, plan, response, reason, request_id, attempts, payloadResolved }) {
  return {
    bp_id: BP_CONFIG.bp_id,
    api_id: plan.apiDef.id,
    name: plan.staticTags.name,
    email,
    method,
    url,
    status: response ? response.status : undefined,
    body: response ? truncate(response.body) : undefined,
    request_body: payloadResolved === undefined || payloadResolved === null
      ? 'null'
      : truncate(JSON.stringify(payloadResolved)),
    reason,
    request_id,
    attempts,
  };
}

// ─── MAIN BP FUNCTION ──────────────────────────────────────────────────────────
export function BP001(data) {
  const vuId = exec.vu.idInTest;
  const userContext = getUserContext(data, vuId);

  if (userContext.error) {
    console.error(`${userContext.error} Skipping iteration.`);
    return;
  }

  const { userKey, userToken } = userContext;
  const email = userToken.email || userKey;
  const iter = exec.scenario.iterationInTest;

  // Per-iteration mutable context (response chaining target).
  const ctx = {};
  const scope = {
    vu: { id: vuId },
    iter,
    now: Date.now(),
    user: {
      key: userKey,
      email,
      token: userToken.token,
      pin_token: userToken.pin_token,
    },
    ctx,
  };

  for (const plan of API_PLAN) {
    const apiDef = plan.apiDef;
    const method = plan.method;
    const metrics = getMetrics(apiDef.id);
    const correlationId = `PT-${vuId}-${iter}-${apiDef.id}-${randomSuffix()}`;

    let url = null;
    let response = null;
    let attempts = 0;
    let payloadResolved = null;

    try {
      url = buildUrl(data.base_url, apiDef, scope);
      const headers = buildHeaders(userToken, vuId, apiDef, scope, correlationId);
      payloadResolved = deepInterpolate(apiDef.payload, scope);
      const serializedBody = serializeBody(payloadResolved, headers);
      const params = buildParams(headers, plan, iter);
      const result = executeWithRetry(plan, method, url, serializedBody, params, metrics);
      response = result.response;
      attempts = result.attempts;
    } catch (error) {
      recordNoResponse(metrics);
      logError(buildErrorFields({
        email, method, url: url || apiDef.path, plan, response: null,
        reason: error.message, request_id: correlationId, attempts: attempts || 1, payloadResolved,
      }));
      continue;
    }

    if (!response) {
      recordNoResponse(metrics);
      logError(buildErrorFields({
        email, method, url: url || apiDef.path, plan, response: null,
        reason: 'no response', request_id: correlationId, attempts, payloadResolved,
      }));
      continue;
    }

    const statusOk = isExpectedStatus(response.status, plan.expectedStatuses);
    const assertion = statusOk ? evaluateAssertions(response, apiDef.assert) : { ok: true };
    if (!assertion.ok && metrics) metrics.assertFail.add(1);
    const isSuccess = statusOk && assertion.ok;

    check(
      response,
      {
        'status is expected': () => statusOk,
        'assertions pass': () => assertion.ok,
      },
      buildRequestTags(plan, iter),
    );

    recordResponse(metrics, response, isSuccess);

    // Extract HANYA setelah success utk hindari race / null injection.
    if (isSuccess && apiDef.extract) {
      applyExtract(response, apiDef.extract, ctx);
    }

    if (isSuccess) {
      if (DEBUG) {
        console.log(`${email} [${method}] ${url} | Status: ${response.status} | RID: ${correlationId}`);
      }
      continue;
    }

    const reason = !statusOk
      ? `expected status: ${plan.formattedExpected}`
      : assertion.reason;

    logError(buildErrorFields({
      email, method, url, plan, response, reason,
      request_id: correlationId, attempts, payloadResolved,
    }));
  }

  sleep(getThinkTimeSeconds());
}
