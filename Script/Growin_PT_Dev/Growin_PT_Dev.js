// pip install pyyaml 
// Gcloud compute ssh --project compute-dev-0108 --zone asia-southeast2-c "vm-dev-k6-0" --tunnel-through-iap -- -L 22:10.188.2.36:22

// BP_JSON=$(python3 -c "import sys,yaml,json; print(json.dumps(yaml.safe_load(open('Configs/BP001.yaml'))))")
// ../../k6 run Growin_PT_Dev.js -e RUNBY=Manual -e ENV=INT -e USER=5 -e DURATION=1m -e NUMSTART=71 -e SCENARIO=BP001 -e PLATFORM=Web -e BP_CONFIG="$BP_JSON"
/**
 * Growin_PT_Dev.js — Main k6 entry point
 * 
 * Jenkins command example:
 *   echo $BP_JSON | python3 -c "import sys,json; d=json.load(sys.stdin); [print(a['id'], a['name']) for a in d['apis']]"
 *   k6 run Growin_PT_Dev.js \
 *     -e RUNBY=LoadTest \
 *     -e ENV=INT \
 *     -e USER=200 \
 *     -e DURATION=5m \
 *     -e NUMSTART=101 \
 *     -e SCENARIO=BP001 \
 *     -e PLATFORM=Web \
 *     -e BP_CONFIG="$BP_JSON" \
 *     --out dashboard=export=../../Report/...html
 */

import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport }  from '../../Helper/bundle.js';
import { BP001, buildThresholds } from "./Web/BP001.js";
import http   from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";
export { BP001 } from "./Web/BP001.js";

// ─── PLATFORM ──────────────────────────────────────────────────────────────────
function getPlatform() {
    const { PLATFORM } = __ENV;
    if (PLATFORM && ['Web', 'Android', 'iOS'].includes(PLATFORM)) return PLATFORM;
    console.error('❌ PLATFORM must be specified: Web, Android, or iOS. Defaulting to Web.');
    return 'Web';
}
const platform = getPlatform();

// ─── BP CONFIG ─────────────────────────────────────────────────────────────────
let BP_CONFIG = null;
try {
    const raw = `${__ENV.BP_CONFIG}`;
    if (raw && raw !== 'undefined') {
        BP_CONFIG = JSON.parse(raw);
    } else {
        throw new Error("BP_CONFIG not provided.");
    }
} catch (e) {
    console.error(`❌ BP_CONFIG parse error: ${e.message}`);
}

// ─── RETRY CONFIG ──────────────────────────────────────────────────────────────
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 1;

// ─── BP USER DISTRIBUTION ──────────────────────────────────────────────────────
const BP_USER_PERCENTAGE = {
    BP001: 100,
    // Add more BPs here as you expand
};

function calculateUserDistribution(totalUsers, selectedBPs) {
    const distribution = {};
    let totalPercentage = selectedBPs.reduce((sum, bp) => sum + (BP_USER_PERCENTAGE[bp] || 0), 0);

    if (totalPercentage === 0) {
        console.error('❌ No valid BP selected or percentage not defined!');
        return distribution;
    }

    let allocated = 0;
    selectedBPs.forEach((bp, i) => {
        if (i === selectedBPs.length - 1) {
            distribution[bp] = totalUsers - allocated;
        } else {
            const users = Math.floor((BP_USER_PERCENTAGE[bp] / totalPercentage) * totalUsers);
            distribution[bp] = users;
            allocated += users;
        }
    });

    return distribution;
}

const { SCENARIO } = __ENV;
const TOTAL_USER = parseInt(__ENV.TOTAL_USER) || parseInt(__ENV.USER) || 100;

const selectedBPs = SCENARIO
    ? SCENARIO.split(',').map(s => s.trim())
    : Object.keys(BP_USER_PERCENTAGE);

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

console.log('📊 User Distribution:');
selectedBPs.forEach(bp => {
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_USER_PERCENTAGE[bp]}%)`);
});
console.log(`   TOTAL: ${TOTAL_USER} users | PLATFORM: ${platform}`);

// ─── SCENARIOS ─────────────────────────────────────────────────────────────────
const scenarios = {};
selectedBPs.forEach(bp => {
    scenarios[bp] = {
        executor: 'constant-vus',
        vus: userDistribution[bp] || 1,
        duration: `${__ENV.DURATION}`,
        gracefulStop: '30s',
        exec: bp,
    };
});

// ─── DYNAMIC THRESHOLDS ────────────────────────────────────────────────────────
// Thresholds are built from the YAML config so each API gets its own threshold entry.
// abortOnFail: false → test completes fully, Jenkins pipeline doesn't abort,
// but k6 exit code will be non-zero so Jenkins can mark build as UNSTABLE/FAILED.
const dynamicThresholds = BP_CONFIG ? buildThresholds(BP_CONFIG) : {};

// Global fallback thresholds
const globalThresholds = {
    http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: false }],
    http_req_duration: [{ threshold: 'p(95)<800', abortOnFail: false }],
    ...dynamicThresholds,
};

export const options = {
    scenarios,
    thresholds: globalThresholds,
    noConnectionReuse: false,
    setupTimeout:    '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
};

// ─── ENV / BASE URL ────────────────────────────────────────────────────────────
function getBaseUrl() {
    const envMap = {
        DEV: 'https://internal-api-dev.growin.id ',
        QA:  'https://api-qa.growin.id',
        DRC: 'https://drc-api.growin.id',
        INT: 'https://internal-api-pt.growin.id',
    };
    return envMap[`${__ENV.ENV}`] || 'https://internal-api-pt.growin.id';
}

function getUserCredentials(userNum, bpOffset = 0) {
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    const actualUserNum = userNum + bpOffset;
    const env = `${__ENV.ENV}`;

    let email = '';
    if (env === 'DEV' || env === 'QA') {
        const n = String(startNum + actualUserNum - 1).padStart(3, '0');
        email = `mostng${n}@guysmail.com`;
    } else if (env === 'DRC') {
        const n = String(startNum + actualUserNum - 1);
        email = `MOSTNG${n}@guysmail.com`;
    } else if (env === 'INT') {
        const n = String(startNum + actualUserNum - 1).padStart(2, '0');
        email = `TESTMON${n}@guysmail.com`;
    }

    return { email, password: 'M@nsek.123' };
}

// ─── LOGIN WITH RETRY ──────────────────────────────────────────────────────────
function loginWithRetry(base_url, credentials, userKey, vuId) {
    const loginHeaders = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };
    const payload = JSON.stringify({
        password: credentials.password,
        email: credentials.email,
        recaptcha: '',
    });

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: loginHeaders });
        if (res.status === 200) {
            if (attempt > 1) {
                console.log(`   ✅ User ${userKey} (${credentials.email}) LOGIN SUCCESS on attempt ${attempt}`);
            }
            return { success: true, token: res.json().data.token, attempts: attempt };
        }
        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(`   ⚠️  User ${userKey} LOGIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED (${res.status}), retrying...`);
            sleep(RETRY_DELAY);
        } else {
            console.error(`   ❌ User ${userKey} LOGIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts (${res.status})`);
        }
    }
    return { success: false, token: null, attempts: MAX_RETRY_ATTEMPTS };
}

// ─── SETUP ─────────────────────────────────────────────────────────────────────
export function setup() {
    const base_url = getBaseUrl();
    const tokens   = {};
    const vuMapping = {};

    const BATCH_SIZE  = 500;
    const BATCH_DELAY = 2;

    console.log(`🔐 Starting login for ${TOTAL_USER} users...`);
    console.log(`📦 Batch: ${BATCH_SIZE}/batch | Retry: max ${MAX_RETRY_ATTEMPTS} attempts`);
    console.log(`📱 Platform: ${platform}`);

    let globalUserOffset = 0;
    let globalVuOffset   = 1;
    let totalLoginSuccess = 0, totalLoginFailed = 0;
    let totalPinSuccess   = 0, totalPinFailed   = 0;
    let totalLoginRetries = 0;

    selectedBPs.forEach(bp => {
        const usersForThisBP = userDistribution[bp];
        console.log(`\n📦 ${bp} on ${platform}: ${usersForThisBP} users (VU ${globalVuOffset}–${globalVuOffset + usersForThisBP - 1})`);

        for (let i = 1; i <= usersForThisBP; i++) {
            vuMapping[globalVuOffset + i - 1] = {
                bp,
                userKey: globalUserOffset + i,
            };
        }

        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE + 1;
            const batchEnd   = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}–${batchEnd}`);

            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey     = globalUserOffset + i;
                const vuId        = globalVuOffset + i - 1;
                const loginResult = loginWithRetry(base_url, credentials, userKey, vuId);

                if (loginResult.success) {
                    totalLoginSuccess++;
                    totalLoginRetries += loginResult.attempts - 1;

                    tokens[userKey] = {
                        email: credentials.email,
                        token: loginResult.token,
                        pin_token: null,
                        bp,
                    };

                    // ─── PIN LOGIN ──────────────────────────────────────────
                    const pinPayload = JSON.stringify({ value: "123456" });
                    const pinHeaders = {
                        'Content-Type':     'application/json',
                        'Accept':           '*/*',
                        'Accept-Language':  'en',
                        'Connection':       'keep-alive',
                        'Accept-Encoding':  'gzip, deflate, br',
                        'Cookie':           `ACCESS_TOKEN=${loginResult.token};`,
                        'User-Agent':       'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
                        'X-App-Name':       'web',
                        'X-App-Version':    '1.4.1',
                        'X-Device-Info':    'iPhone 11',
                        'X-Device-Id':      'TEST3',
                    };

                    const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
                    // console.log(`DEBUG - token: '${loginResult.token}' | pin: '${pinRes.json().data.pin_token}'`);

                    if (pinRes.status === 200) {
                        totalPinSuccess++;
                        tokens[userKey].pin_token = pinRes.json().data.pin_token;
                    } else {
                        totalPinFailed++;
                        if (i === batchStart || totalPinFailed <= 5) {
                            console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) PIN FAILED - Status: ${pinRes.status}`);
                        }
                        tokens[userKey].pin_token = null;
                    }
                    // ───────────────────────────────────────────────────────

                } else {
                    totalLoginFailed++;
                    totalLoginRetries += loginResult.attempts - 1;
                    tokens[userKey] = {
                        email: credentials.email,
                        token: null,
                        pin_token: null,
                        bp,
                    };
                }
            }

            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            if (batchNum < numBatches - 1) sleep(BATCH_DELAY);
        }

        globalUserOffset += usersForThisBP;
        globalVuOffset   += usersForThisBP;
    });

    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login: ${totalLoginSuccess}/${TOTAL_USER} (${((totalLoginSuccess / TOTAL_USER) * 100).toFixed(1)}%)`);
    if (totalLoginFailed  > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
    if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries}`);
    console.log(`   ✅ PIN:   ${totalPinSuccess}/${TOTAL_USER} (${((totalPinSuccess / TOTAL_USER) * 100).toFixed(1)}%)`);
    if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);

    return { base_url, tokens, vuMapping };
}

// ─── HANDLE SUMMARY ────────────────────────────────────────────────────────────
// This is where we calculate RPS per API and add PASS/FAIL verdict.
export function handleSummary(data) {
    try {
        if (!data.metrics.data_received) data.metrics.data_received = { values: { count: 0, rate: 0 } };
        if (!data.metrics.data_sent)     data.metrics.data_sent     = { values: { count: 0, rate: 0 } };

        const now     = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        const runby   = __ENV.RUNBY || 'Manual';

        let bp_name = 'AllBP';
        if (selectedBPs.length === 1) {
            bp_name = selectedBPs[0];
        } else {
            const nums = selectedBPs
                .map(x => parseInt(x.replace('BP', '')))
                .filter(x => !isNaN(x))
                .sort((a, b) => a - b);
            if (nums.length > 0) {
                bp_name = `BP${String(nums[0]).padStart(3,'0')}-BP${String(nums[nums.length-1]).padStart(3,'0')}`;
            }
        }

        // ── RPS + PASS/FAIL Verdict per API ───────────────────────────────
        const thresholdConfig = BP_CONFIG?.thresholds || {};
        const minRps          = thresholdConfig.min_rps || 400;
        const maxAvgRespTime  = thresholdConfig.avg_response_time_ms || 200;
        const maxErrorRate    = (thresholdConfig.error_rate_percent || 0.1) / 100;

        // Total test duration in seconds (from k6 data)
        const testDurationSec = data.state?.testRunDurationMs
            ? data.state.testRunDurationMs / 1000
            : parseFloat(`${__ENV.DURATION}`) || 300;

        const apiResults = [];
        const apis = BP_CONFIG?.apis || [];

        apis.forEach(apiDef => {
            const bpId     = BP_CONFIG?.bp_id || 'BP001';
            const safeId   = String(bpId).replace(/[^a-zA-Z0-9]/g, '_');
            const safeApiId = String(apiDef.id).replace(/[^a-zA-Z0-9]/g, '_');
            const safeName  = String(apiDef.name).replace(/[^a-zA-Z0-9]/g, '_');
            const tag       = `${safeId}_${safeApiId}_${safeName}`;

            const durationMetric  = data.metrics[`duration_${tag}`];
            const errorRateMetric = data.metrics[`error_rate_${tag}`];
            const sampleMetric    = data.metrics[`sample_${tag}`];

            if (!durationMetric) return; // API might not have been reached

            const avgRespTime = durationMetric.values?.med          || 0;
            const p95RespTime = durationMetric.values?.['p(95)']    || 0;
            const errorRate   = errorRateMetric?.values?.rate        || 0;
            const totalReqs   = sampleMetric?.values?.count          || 0;
            const actualRps   = totalReqs / testDurationSec;

            const passRespTime  = p95RespTime < maxAvgRespTime;
            const passErrorRate = errorRate < maxErrorRate;
            const passRps       = actualRps >= minRps;
            const verdict       = passRespTime && passErrorRate && passRps ? '✅ PASS' : '❌ FAIL';

            const reasons = [];
            if (!passRespTime)  reasons.push(`p95 resp time ${p95RespTime.toFixed(0)}ms ≥ threshold ${maxAvgRespTime}ms`);
            if (!passErrorRate) reasons.push(`error rate ${(errorRate * 100).toFixed(2)}% ≥ threshold ${(maxErrorRate * 100).toFixed(2)}%`);
            if (!passRps)       reasons.push(`RPS ${actualRps.toFixed(1)} < threshold ${minRps}`);

            apiResults.push({
                id:          apiDef.id,
                name:        apiDef.name,
                method:      apiDef.method,
                path:        apiDef.path,
                verdict,
                p95:         p95RespTime.toFixed(0),
                avgRespTime: avgRespTime.toFixed(0),
                errorRate:   (errorRate * 100).toFixed(2),
                rps:         actualRps.toFixed(1),
                totalReqs,
                reasons,
            });

            // Also log to stdout for Jenkins console
            console.log(
                `[${verdict}] ${apiDef.id} ${apiDef.method} ${apiDef.path} | ` +
                `p95: ${p95RespTime.toFixed(0)}ms | ErrorRate: ${(errorRate*100).toFixed(2)}% | RPS: ${actualRps.toFixed(1)}`
            );
            if (reasons.length > 0) {
                console.error(`   ⛔ FAIL Reasons: ${reasons.join('; ')}`);
            }
        });

        // Overall verdict — FAIL if any API failed
        const overallPass = apiResults.every(r => r.verdict === '✅ PASS');
        console.log(`\n🏁 Overall Result: ${overallPass ? '✅ ALL PASS' : '❌ SOME APIs FAILED'}`);
        console.log(`   (k6 will exit with non-zero code if any threshold was breached — Jenkins can read this)`);

        // ── Report Paths ────────────────────────────────────────────────────
        let htmlPath = '';
        const base = `../../Report/Growin_PT_Dev/${platform}`;

        if (runby === 'Manual') {
            htmlPath = `${base}/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
        } else if (runby === 'Regression') {
            htmlPath = `${base}/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
        } else if (runby === 'LoadTest') {
            htmlPath = `${base}/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
        } else {
            htmlPath = `${base}/${platform}/${bp_name}/${runby}_${bp_name}_${dateStr}_${timeStr}.html`;
        }

        console.log(`Generating HTML report: ${htmlPath}`);

        return {
            [htmlPath]: htmlReport(data),
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };

    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        return { 'stdout': textSummary(data, { indent: ' ', enableColors: true }) };
    }
}