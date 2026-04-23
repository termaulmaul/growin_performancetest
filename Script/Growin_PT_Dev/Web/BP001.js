// /**
//  * Dynamic BP Runner - Web/BP001.js
//  * 
//  * This script is fully driven by a JSON config (converted from YAML by Jenkins pipeline).
//  * It supports GET, POST, PUT, PATCH methods, dynamic path params, query params, and payloads.
//  * 
//  * Jenkins pipeline must convert YAML → JSON and pass via:
//  *   k6 run ... -e BP_CONFIG='{"bp_id":"BP001","apis":[...],...}'
//  * 
//  * OR pass as a file path:
//  *   k6 run ... -e BP_CONFIG_FILE=./configs/BP001.json
//  */

// import { check, sleep } from "k6";
// import { Trend, Counter, Rate } from "k6/metrics";
// import http from "k6/http";
// import exec from "k6/execution";

// // ─── CONFIG LOADER ─────────────────────────────────────────────────────────────
// // Config is injected by Jenkins as a JSON string via BP_CONFIG env var.
// // The YAML-to-JSON conversion happens OUTSIDE k6 (in Jenkins shell step).
// let BP_CONFIG = null;

// try {
//     const raw = `${__ENV.BP_CONFIG}`;
//     if (raw && raw !== 'undefined') {
//         BP_CONFIG = JSON.parse(raw);
//     } else {
//         throw new Error("BP_CONFIG env var is not set or empty.");
//     }
// } catch (e) {
//     console.error(`❌ Failed to parse BP_CONFIG: ${e.message}`);
//     console.error(`   Make sure Jenkins pipeline converts YAML to JSON and passes via -e BP_CONFIG='...'`);
// }

// // ─── DYNAMIC METRIC REGISTRY ───────────────────────────────────────────────────
// // Metrics are created dynamically per API definition in the config.
// // Naming convention: {type}_{bp_id}_{api_id}_{api_name}
// const metricRegistry = {};

// function getOrCreateMetrics(bpId, apiId, apiName) {
//     const key = `${bpId}_${apiId}`;
//     if (metricRegistry[key]) return metricRegistry[key];

//     const safeId   = String(bpId).replace(/[^a-zA-Z0-9]/g, '_');
//     const safeApiId = String(apiId).replace(/[^a-zA-Z0-9]/g, '_');
//     const safeName  = String(apiName).replace(/[^a-zA-Z0-9]/g, '_');
//     const tag       = `${safeId}_${safeApiId}_${safeName}`;

//     metricRegistry[key] = {
//         httpDuration: new Trend(`duration_${tag}`),
//         httpWaiting:  new Trend(`waiting_${tag}`),
//         errorRate:    new Rate(`error_rate_${tag}`),
//         errorCount:   new Counter(`error_count_${tag}`),
//         requestCount: new Counter(`sample_${tag}`),
//     };

//     return metricRegistry[key];
// }

// // ─── THRESHOLD BUILDER ─────────────────────────────────────────────────────────
// // Called from Growin_PT_Dev.js to dynamically build thresholds for options{}.
// // abortOnFail: false → Jenkins pipeline keeps running even if threshold breached.
// export function buildThresholds(config) {
//     if (!config || !config.apis) return {};

//     const thresholdConfig = config.thresholds || {};
//     const avgRespTime = thresholdConfig.avg_response_time_ms || 200;
//     const errorRate   = (thresholdConfig.error_rate_percent || 0.1) / 100;
//     const minRps      = thresholdConfig.min_rps || 381;

//     const thresholds = {};
//     const bpId       = config.bp_id;

//     config.apis.forEach(api => {
//         const safeId   = String(bpId).replace(/[^a-zA-Z0-9]/g, '_');
//         const safeApiId = String(api.id).replace(/[^a-zA-Z0-9]/g, '_');
//         const safeName  = String(api.name).replace(/[^a-zA-Z0-9]/g, '_');
//         const tag       = `${safeId}_${safeApiId}_${safeName}`;

//         // // p(95) response time threshold
//         // thresholds[`duration_${tag}`] = [
//         //     {
//         //         threshold: `p(95)<${avgRespTime}`,
//         //         abortOnFail: false,
//         //         allowNoData: true,   // ← tambah ini
//         //     }
//         // ];

//         // // Error rate threshold
//         // thresholds[`error_rate_${tag}`] = [
//         //     {
//         //         threshold: `rate<${errorRate}`,
//         //         abortOnFail: false,
//         //         allowNoData: true,   // ← tambah ini
//         //     }
//         // ];
//         // // RPS threshold — uses sample counter divided by test duration
//         // // k6 doesn't natively support rate threshold on Counter, so we check
//         // // via http_req_duration trend + rely on Counter for reporting.
//         // // For actual RPS enforcement, use: sample_{tag} with checks in handleSummary.
//         // // Note: This is a known k6 limitation — RPS thresholds on Counters are not supported natively.
//         // // The handleSummary in Growin_PT_Dev.js will calculate and flag this as pass/fail.
//         // thresholds[`sample_${tag}`] = [
//         //     {
//         //         threshold: `count>0`,
//         //         abortOnFail: false,
//         //         allowNoData: true,   // ← tambah ini
//         //     }
//         // ];
//     });

//     return thresholds;
// }

// // ─── URL BUILDER ───────────────────────────────────────────────────────────────
// function buildUrl(baseUrl, apiDef) {
//     let path = apiDef.path;

//     // Resolve path params: /order/{id} → /order/12345
//     if (apiDef.path_params && typeof apiDef.path_params === 'object') {
//         Object.entries(apiDef.path_params).forEach(([key, value]) => {
//             path = path.replace(`{${key}}`, encodeURIComponent(value));
//         });
//     }

//     // Append query params
//     if (apiDef.query_params && typeof apiDef.query_params === 'object') {
//         const qs = Object.entries(apiDef.query_params)
//             .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
//             .join('&');
//         if (qs) path = `${path}?${qs}`;
//     }

//     return baseUrl + path;
// }

// // ─── REQUEST DISPATCHER ────────────────────────────────────────────────────────
// function dispatchRequest(method, url, payload, headers) {
//     const body = payload ? JSON.stringify(payload) : null;
//     const params = { headers };

//     switch (method.toUpperCase()) {
//         case 'GET':    return http.get(url, params);
//         case 'POST':   return http.post(url, body, params);
//         case 'PUT':    return http.put(url, body, params);
//         case 'PATCH':  return http.patch(url, body, params);
//         case 'DELETE': return http.del(url, body, params);
//         default:
//             console.error(`❌ Unsupported HTTP method: ${method}`);
//             return null;
//     }
// }

// // ─── MAIN BP FUNCTION ──────────────────────────────────────────────────────────
// export function BP001(data) {
//     if (!BP_CONFIG) {
//         console.error('❌ BP_CONFIG not loaded. Skipping iteration.');
//         return;
//     }

//     const vuId      = exec.vu.idInTest;
//     const base_url  = data.base_url;
//     const mapping   = data.vuMapping[vuId];

//     if (!mapping) {
//         console.error(`❌ VU${vuId} - No VU mapping found, skipping.`);
//         return;
//     }

//     const userKey   = mapping.userKey;
//     const userToken = data.tokens[userKey];

//     if (!userToken || !userToken.token || !userToken.pin_token) {
//         console.error(`❌ VU${vuId} (User ${userKey}) - Invalid token, skipping.`);
//         return;
//     }

//     const token     = userToken.token;
//     const email     = userToken.email;
//     const bpId      = BP_CONFIG.bp_id;
//     const apis      = BP_CONFIG.apis || [];

//     const headers = {
//         'Cookie':           `ACCESS_TOKEN=${token};`,
//         'Content-Type':     'application/json',
//         'Accept':           '*/*',
//         'Accept-Language':  'en',
//         'Connection':       'keep-alive',
//         'Accept-Encoding':  'gzip, deflate, br',
//         'User-Agent':       'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
//         'X-App-Name':       'web',
//         'X-App-Version':    '1.4.1',
//         'X-Device-Info':    'iPhone 11',
//         'X-Device-Id':      'TEST3',
//     };

//     // ── Iterate through ALL APIs defined in config, one by one ──────────────
//     for (const apiDef of apis) {
//         const url     = buildUrl(base_url, apiDef);
//         const method  = apiDef.method || 'GET';
//         const payload = apiDef.payload || null;
//         const metric  = getOrCreateMetrics(bpId, apiDef.id, apiDef.name);

//         const response = dispatchRequest(method, url, payload, headers);

//         if (!response) {
//             console.error(`❌ VU${vuId} - No response for ${method} ${url}`);
//             metric.errorRate.add(true);
//             metric.errorCount.add(1);
//             metric.requestCount.add(1);
//             continue;
//         }

//         // Record metrics
//         metric.httpDuration.add(response.timings.duration);
//         metric.httpWaiting.add(response.timings.waiting);
//         metric.requestCount.add(1);

//         const isSuccess = response.status >= 200 && response.status < 300;

//         if (isSuccess) {
//             metric.errorRate.add(false);
//             metric.errorCount.add(0);

//             if (`${__ENV.ENV}` !== 'INT') {
//                 console.log(`✅ ${email} [${method}] ${url} | Status: ${response.status}`);
//             }
//         } else {
//             metric.errorRate.add(true);
//             metric.errorCount.add(1);

//             // check() records a failed check in k6 output — visible in report
//             check(response, {
//                 [`❌ [${method}] ${url} | Status: ${response.status} | Body: ${response.body}`]:
//                     (r) => r.status >= 200 && r.status < 300,
//             });

//             console.error(
//                 `❌ ${email} [${method}] ${url} | Status: ${response.status} ` +
//                 `| Response: ${response.body} | RequestBody: ${payload ? JSON.stringify(payload) : 'null'}`
//             );
//         }

//         // Small sleep between API calls within same iteration to avoid burst
//         sleep(0.1);
//     }

//     sleep(0.25);
// }

/**
 * Dynamic BP Runner - Web/BP001.js
 * 
 * This script is fully driven by a JSON config (converted from YAML by Jenkins pipeline).
 * It supports GET, POST, PUT, PATCH methods, dynamic path params, query params, and payloads.
 * 
 * Jenkins pipeline must convert YAML → JSON and pass via:
 *   k6 run ... -e BP_CONFIG='{"bp_id":"BP001","apis":[...],...}'
 * 
 * OR pass as a file path:
 *   k6 run ... -e BP_CONFIG_FILE=./configs/BP001.json
 */

import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from "k6/execution";

// ─── CONFIG LOADER ─────────────────────────────────────────────────────────────
// Config is injected by Jenkins as a JSON string via BP_CONFIG env var.
// The YAML-to-JSON conversion happens OUTSIDE k6 (in Jenkins shell step).
let BP_CONFIG = null;

try {
    const raw = `${__ENV.BP_CONFIG}`;
    if (raw && raw !== 'undefined') {
        BP_CONFIG = JSON.parse(raw);
    } else {
        throw new Error("BP_CONFIG env var is not set or empty.");
    }
} catch (e) {
    console.error(`❌ Failed to parse BP_CONFIG: ${e.message}`);
    console.error(`   Make sure Jenkins pipeline converts YAML to JSON and passes via -e BP_CONFIG='...'`);
}

// ─── DYNAMIC METRIC REGISTRY ───────────────────────────────────────────────────
// Metrics MUST be declared in init context (top-level), not inside functions.
// k6 does not allow new Trend/Rate/Counter inside VU execution context.
const metricRegistry = {};

if (BP_CONFIG && BP_CONFIG.apis) {
    BP_CONFIG.apis.forEach(api => {
        const bpId      = BP_CONFIG.bp_id;
        const safeId    = String(bpId).replace(/[^a-zA-Z0-9]/g, '_');
        const safeApiId = String(api.id).replace(/[^a-zA-Z0-9]/g, '_');
        const safeName  = String(api.name).replace(/[^a-zA-Z0-9]/g, '_');
        const tag       = `${safeId}_${safeApiId}_${safeName}`;
        const key       = `${bpId}_${api.id}`;

        metricRegistry[key] = {
            httpDuration: new Trend(`duration_${tag}`),
            httpWaiting:  new Trend(`waiting_${tag}`),
            errorRate:    new Rate(`error_rate_${tag}`),
            errorCount:   new Counter(`error_count_${tag}`),
            requestCount: new Counter(`sample_${tag}`),
        };
    });
}

// Lookup only — no metric creation here
function getOrCreateMetrics(bpId, apiId) {
    const key = `${bpId}_${apiId}`;
    if (!metricRegistry[key]) {
        console.error(`❌ Metric not found for key: ${key} — was it initialized in init context?`);
    }
    return metricRegistry[key];
}

// ─── THRESHOLD BUILDER ─────────────────────────────────────────────────────────
// Called from Growin_PT_Dev.js to dynamically build thresholds for options{}.
// abortOnFail: false → Jenkins pipeline keeps running even if threshold breached.
// Metrics are now pre-initialized above, so threshold validation will not fail.
export function buildThresholds(config) {
    if (!config || !config.apis) return {};

    const thresholdConfig = config.thresholds || {};
    const avgRespTime = thresholdConfig.avg_response_time_ms || 200;
    const errorRate   = (thresholdConfig.error_rate_percent || 0.1) / 100;
    const minRps      = thresholdConfig.min_rps || 381;

    const thresholds = {};
    const bpId       = config.bp_id;

    config.apis.forEach(api => {
        const safeId    = String(bpId).replace(/[^a-zA-Z0-9]/g, '_');
        const safeApiId = String(api.id).replace(/[^a-zA-Z0-9]/g, '_');
        const safeName  = String(api.name).replace(/[^a-zA-Z0-9]/g, '_');
        const tag       = `${safeId}_${safeApiId}_${safeName}`;

        // p(95) response time threshold
        thresholds[`duration_${tag}`] = [
            {
                threshold: `p(95)<${avgRespTime}`,
                abortOnFail: false,
            }
        ];

        // Error rate threshold
        thresholds[`error_rate_${tag}`] = [
            {
                threshold: `rate<${errorRate}`,
                abortOnFail: false,
            }
        ];

        // Sample count — actual RPS verdict is calculated in handleSummary
        thresholds[`sample_${tag}`] = [
            {
                threshold: `count>0`,
                abortOnFail: false,
            }
        ];
    });

    return thresholds;
}

// ─── URL BUILDER ───────────────────────────────────────────────────────────────
function buildUrl(baseUrl, apiDef) {
    let path = apiDef.path;

    // Resolve path params: /order/{id} → /order/12345
    if (apiDef.path_params && typeof apiDef.path_params === 'object') {
        Object.entries(apiDef.path_params).forEach(([key, value]) => {
            path = path.replace(`{${key}}`, encodeURIComponent(value));
        });
    }

    // Append query params
    if (apiDef.query_params && typeof apiDef.query_params === 'object') {
        const qs = Object.entries(apiDef.query_params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        if (qs) path = `${path}?${qs}`;
    }

    return baseUrl + path;
}

// ─── REQUEST DISPATCHER ────────────────────────────────────────────────────────
function dispatchRequest(method, url, payload, headers) {
    const body = payload ? JSON.stringify(payload) : null;
    const params = { headers };

    switch (method.toUpperCase()) {
        case 'GET':    return http.get(url, params);
        case 'POST':   return http.post(url, body, params);
        case 'PUT':    return http.put(url, body, params);
        case 'PATCH':  return http.patch(url, body, params);
        case 'DELETE': return http.del(url, body, params);
        default:
            console.error(`❌ Unsupported HTTP method: ${method}`);
            return null;
    }
}

// ─── MAIN BP FUNCTION ──────────────────────────────────────────────────────────
export function BP001(data) {
    if (!BP_CONFIG) {
        console.error('❌ BP_CONFIG not loaded. Skipping iteration.');
        return;
    }

    const vuId      = exec.vu.idInTest;
    const base_url  = data.base_url;
    const mapping   = data.vuMapping[vuId];

    if (!mapping) {
        console.error(`❌ VU${vuId} - No VU mapping found, skipping.`);
        return;
    }

    const userKey   = mapping.userKey;
    const userToken = data.tokens[userKey];

    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - Invalid token, skipping.`);
        return;
    }

    const token     = userToken.token;
    const pin_token = userToken.pin_token;
    const email     = userToken.email;
    const bpId      = BP_CONFIG.bp_id;
    const apis      = BP_CONFIG.apis || [];

    const headers = {
        // 'Cookie':           `ACCESS_TOKEN=${token};`,
        'Cookie':           `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
        'Content-Type':     'application/json',
        'Accept':           '*/*',
        'Accept-Language':  'en',
        'Connection':       'keep-alive',
        'Accept-Encoding':  'gzip, deflate, br',
        'User-Agent':       'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name':       'web',
        'X-App-Version':    '1.4.1',
        'X-Device-Info':    'iPhone 11',
        'X-Device-Id':      'TEST3',
    };

    // ── Iterate through ALL APIs defined in config, one by one ──────────────
    for (const apiDef of apis) {
        const url     = buildUrl(base_url, apiDef);
        const method  = apiDef.method || 'GET';
        const payload = apiDef.payload || null;
        const metric  = getOrCreateMetrics(bpId, apiDef.id);

        const response = dispatchRequest(method, url, payload, headers);

        if (!response) {
            console.error(`❌ VU${vuId} - No response for ${method} ${url}`);
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestCount.add(1);
            continue;
        }

        // Record metrics
        metric.httpDuration.add(response.timings.duration);
        metric.httpWaiting.add(response.timings.waiting);
        metric.requestCount.add(1);

        const isSuccess = response.status >= 200 && response.status < 300;

        if (isSuccess) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);

            if (`${__ENV.ENV}` !== 'INT') {
                console.log(`✅ ${email} [${method}] ${url} | Status: ${response.status}`);
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);

            // check() records a failed check in k6 output — visible in report
            check(response, {
                [`❌ [${method}] ${url} | Status: ${response.status} | Body: ${response.body}`]:
                    (r) => r.status >= 200 && r.status < 300,
            });

            console.error(
                `❌ ${email} [${method}] ${url} | Status: ${response.status} ` +
                `| Response: ${response.body} | RequestBody: ${payload ? JSON.stringify(payload) : 'null'}`
            );
        }

        // Small sleep between API calls within same iteration to avoid burst
    }

    sleep(0.25);
}