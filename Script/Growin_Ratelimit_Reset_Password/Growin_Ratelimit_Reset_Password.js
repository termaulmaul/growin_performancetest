// ─────────────────────────────────────────────────────────────────────────────
// Growin_Ratelimit_Reset_Password.js — k6 Load Test Script
// ─────────────────────────────────────────────────────────────────────────────
//
// COMMAND EXAMPLES:
//
// Run Multiple BP (LoadTest):
//   ../../../k6 run Growin_Ratelimit_Reset_Password_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 -e PLATFORM=Web --out dashboard=export=../../../Report/Growin_Ratelimit_Reset_Password/Web/LoadTest/Manual_LoadTest_0107_1459.html
//
// Run Single BP Web:
//   ../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY=Manual -e ENV=INT -e USER=1000 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/Web/BP001/Manual/Manual_DryRun_0506_1353_BP001.html
//
// Run Single BP iOS:
//   ../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/iOS/BP001/Manual/Manual_DryRun_0428_1403_BP001.html
//
// Run Single BP Android:
//   ../../k6 run Growin_Ratelimit_Reset_Password.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Ratelimit_Reset_Password/Android/BP001/Manual/Manual_DryRun_0428_1100_BP001.html
//
// ─────────────────────────────────────────────────────────────────────────────
// numStart Priority Rules (per BP):
//   1. Both CLI (-e NUMSTART) and BP_CONFIG.numStart exist → CLI wins
//   2. Only BP_CONFIG.numStart exists                       → use BP_CONFIG value
//   3. Only CLI (-e NUMSTART) exists                        → use CLI value
//   4. Neither exists                                        → use 1
//   5. Multi-BP, no numStart declared anywhere              → auto-continue
//                                                              (BP1: 1–N, BP2: N+1–M, …)
// ─────────────────────────────────────────────────────────────────────────────

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from '../../Helper/textSummary.js';
import { htmlReport } from '../../Helper/bundle.js';

// ─── BP FUNCTION IMPORTS — Web ────────────────────────────────────────────────
import { BP001 as BP001_Web } from './Web/BP001.js';
import { BP002 as BP002_Web } from './Web/BP002.js';

// ─── BP FUNCTION IMPORTS — iOS ────────────────────────────────────────────────
// import { BP001 as BP001_iOS } from './iOS/BP001.js';
// import { BP002 as BP002_iOS } from './iOS/BP002.js';

// ─── BP FUNCTION IMPORTS — Android ───────────────────────────────────────────
// import { BP001 as BP001_Android } from './Android/BP001.js';
// import { BP002 as BP002_Android } from './Android/BP002.js';

import http from 'k6/http';
import { sleep } from 'k6';

http.setResponseCallback(http.expectedStatuses(200, 201, 400, 401, 403, 404, 500));

// ─────────────────────────────────────────────────────────────────────────────
// BP CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
//
// skipSetupLogin:
//   true  → BP handles its own login per iteration; setup() only assigns email.
//   false → setup() logs in and passes token to BP.
//
// numStart (optional):
//   Starting user number for this BP. Follow priority rules at the top of file.
//   Omit the key entirely to rely on CLI / auto-continue logic.
//
// ─────────────────────────────────────────────────────────────────────────────
const BP_CONFIG = {
    Web: {
        BP001: { fn: BP001_Web, skipSetupLogin: true },
        BP002: { fn: BP002_Web, skipSetupLogin: false },
    },
    // iOS: {
    //     BP001: { fn: BP001_iOS, skipSetupLogin: true,  numStart: 1001 },
    //     BP002: { fn: BP002_iOS, skipSetupLogin: false                  },
    // },
    // Android: {
    //     BP001: { fn: BP001_Android, skipSetupLogin: false, numStart: 1001 },
    //     BP002: { fn: BP002_Android, skipSetupLogin: false                  },
    // },
};

// ─── User distribution (percentage per BP across all platforms) ───────────────
const BP_USER_PERCENTAGE = {
    BP001: 50,
    BP002: 50,
};

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM DETECTION
// ─────────────────────────────────────────────────────────────────────────────
function getPlatform() {
    const { PLATFORM } = __ENV;

    if (PLATFORM && ['Android', 'iOS', 'Web'].includes(PLATFORM)) {
        return PLATFORM;
    }

    console.error('❌ PLATFORM must be specified: Android, iOS, or Web');
    console.error('   Example: -e PLATFORM=Web');
    return 'Web'; // default fallback
}

const platform = getPlatform();

// ─────────────────────────────────────────────────────────────────────────────
// BP DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
// Routes BP name + platform to the correct imported function.
// ─────────────────────────────────────────────────────────────────────────────
const BP_MAP = Object.fromEntries(
    Object.entries(BP_CONFIG).map(([plt, bps]) => [
        plt,
        Object.fromEntries(Object.entries(bps).map(([bp, cfg]) => [bp, cfg.fn])),
    ])
);

function dispatch(bpName, data) {
    const fn = BP_MAP[platform]?.[bpName];
    if (!fn) throw new Error(`❌ ${bpName} not found for platform: ${platform}`);
    return fn(data);
}

// k6 calls these exported functions — one per VU iteration.
export function BP001(data) { return dispatch('BP001', data); }
export function BP002(data) { return dispatch('BP002', data); }

// ─────────────────────────────────────────────────────────────────────────────
// SELECTED BPs & USER DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────
const { SCENARIO } = __ENV;
const TOTAL_USER   = parseInt(__ENV.TOTAL_USER) || parseInt(__ENV.USER) || 100;

// Single/specific BP  → from -e SCENARIO=BP001 or -e SCENARIO=BP001,BP002
// LoadTest (no SCENARIO) → all BPs registered in BP_CONFIG for this platform
const selectedBPs = SCENARIO
    ? SCENARIO.split(',').map(s => s.trim())
    : Object.keys(BP_CONFIG[platform] || {});

if (selectedBPs.length === 0) {
    console.error(`❌ No BPs registered for platform: ${platform}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// USER DISTRIBUTION CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────
function calculateUserDistribution(totalUsers, bps) {
    const distribution = {};
    const totalPct = bps.reduce((sum, bp) => sum + (BP_USER_PERCENTAGE[bp] || 0), 0);

    if (totalPct === 0) {
        console.error('❌ No valid BP selected or percentage not defined!');
        return distribution;
    }

    let allocated = 0;
    bps.forEach((bp, i) => {
        if (i === bps.length - 1) {
            // Last BP gets the remainder to avoid rounding drift
            distribution[bp] = totalUsers - allocated;
        } else {
            const users = Math.floor((BP_USER_PERCENTAGE[bp] / totalPct) * totalUsers);
            distribution[bp] = users;
            allocated += users;
        }
    });

    return distribution;
}

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

console.log('📊 User Distribution:');
selectedBPs.forEach(bp => {
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_USER_PERCENTAGE[bp]}%)`);
});
console.log(`   TOTAL    : ${TOTAL_USER} users`);
console.log(`   PLATFORM : ${platform}`);

// ─────────────────────────────────────────────────────────────────────────────
// numStart RESOLVER
// ─────────────────────────────────────────────────────────────────────────────
// Resolves the starting user number for every BP according to priority rules:
//
//   Priority (highest → lowest):
//     1. CLI (-e NUMSTART) if present               — CLI wins when both exist
//     2. BP_CONFIG[bp].numStart if present           — config-only fallback
//     3. auto-continue from previous BP              — multi-BP, nothing declared
//     4. default 1                                   — single BP, nothing declared
//
// Returns: { [bpName]: effectiveNumStart }
// ─────────────────────────────────────────────────────────────────────────────
function resolveNumStarts(bps, platform, isMultiBP) {
    const CLI_NUMSTART     = __ENV.NUMSTART !== undefined ? parseInt(__ENV.NUMSTART) : null;
    const hasCLI           = CLI_NUMSTART !== null && !isNaN(CLI_NUMSTART);
    const resolved         = {};
    let   autoNextStart    = hasCLI ? CLI_NUMSTART : 1; // cursor for auto-continue

    bps.forEach(bp => {
        const cfgNumStart    = BP_CONFIG[platform]?.[bp]?.numStart ?? null;
        const hasCfg         = cfgNumStart !== null;

        let effectiveStart;

        if (hasCLI && hasCfg) {
            // Rule 1: both present → CLI wins
            effectiveStart = CLI_NUMSTART;
        } else if (!hasCLI && hasCfg) {
            // Rule 2: only config → use config
            effectiveStart = cfgNumStart;
        } else if (hasCLI && !hasCfg) {
            // Rule 3: only CLI → use CLI (single BP) or auto-continue (multi-BP)
            effectiveStart = isMultiBP ? autoNextStart : CLI_NUMSTART;
        } else {
            // Rule 4 / Rule 5: nothing declared
            effectiveStart = isMultiBP ? autoNextStart : 1;
        }

        resolved[bp]  = effectiveStart;
        // Advance cursor by the number of users assigned to this BP
        autoNextStart = effectiveStart + (userDistribution[bp] || 0);
    });

    return resolved;
}

const isMultiBP   = selectedBPs.length > 1;
const numStarts   = resolveNumStarts(selectedBPs, platform, isMultiBP);

console.log('🔢 Resolved numStart per BP:');
selectedBPs.forEach(bp => console.log(`   ${bp}: numStart = ${numStarts[bp]}`));

// ─────────────────────────────────────────────────────────────────────────────
// k6 SCENARIO OPTIONS
// ─────────────────────────────────────────────────────────────────────────────
const scenarios = {};
selectedBPs.forEach(bp => {
    scenarios[bp] = {
        executor:     'constant-vus',
        vus:          userDistribution[bp] || 1,
        duration:     `${__ENV.DURATION}`,
        gracefulStop: '30s',
        exec:         bp,

        // ── Other executors (uncomment to use) ───────────────────────────────
        // executor: 'per-vu-iterations',
        // vus: 1000, iterations: 1, maxDuration: '1h',

        // executor: 'ramping-vus',
        // startVUs: 0,
        // stages: [
        //     { duration: '5m', target: 100 }, { duration: '10m', target: 100 },
        //     { duration: '5m', target: 200 }, { duration: '10m', target: 200 },
        //     ...
        //     { duration: '5m', target: 0 },
        // ],
    };
});

export const options = {
    scenarios,
    noConnectionReuse: false,
    setupTimeout:      '3600s',
    teardownTimeout:   '3600s',
    summaryTimeUnit:   '3600s',
    // httpDebug: 'full',
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN WITH RETRY
// ─────────────────────────────────────────────────────────────────────────────
// Attempts login up to MAX_RETRY_ATTEMPTS times with RETRY_DELAY between tries.
// Returns { success, token, attempts }.
// ─────────────────────────────────────────────────────────────────────────────
function loginWithRetry(base_url, credentials, userKey, vuId) {
    const payload = JSON.stringify({
        email:     credentials.email,
        password:  credentials.password,
        recaptcha: '',
    });
    const headers = getDefaultHeaders();

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        const res = http.post(`${base_url}/auth/api/v1/login`, payload, { headers });

        if (res.status === 200) {
            if (attempt > 1) {
                console.log(`   ✅ User ${userKey} (${credentials.email}, VU${vuId}) login OK on attempt ${attempt}`);
            }
            return { success: true, token: res.json().data.token, attempts: attempt };
        }

        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(
                `   ⚠️  User ${userKey} (${credentials.email}, VU${vuId}) ` +
                `login attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED — ` +
                `Status: ${res.status} | Body: ${res.body} — retrying…`
            );
            sleep(RETRY_DELAY);
        } else {
            console.error(
                `   ❌ User ${userKey} (${credentials.email}, VU${vuId}) ` +
                `login FAILED after ${MAX_RETRY_ATTEMPTS} attempts — Status: ${res.status}`
            );
        }
    }

    return { success: false, token: null, attempts: MAX_RETRY_ATTEMPTS };
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN LOGIN
// ─────────────────────────────────────────────────────────────────────────────
// Exchanges the session token for a PIN token.
// Returns pin_token string or null on failure.
// ─────────────────────────────────────────────────────────────────────────────
function fetchPinToken(base_url, token, userKey, vuId, email) {
    const res = http.post(
        `${base_url}/auth/api/v1/protected/pin-login`,
        JSON.stringify({ value: '123456' }),
        { headers: getDefaultHeaders(token) }
    );

    if (res.status === 200) {
        return res.json().data.pin_token;
    }

    console.error(
        `   ❌ User ${userKey} (${email}, VU${vuId}) PIN login FAILED — Status: ${res.status}`
    );
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADING PROFILE FETCH
// ─────────────────────────────────────────────────────────────────────────────
// Retrieves user_id, client_id, SID, ksei_acc_no, account_name.
// Returns the profile object or null on failure.
// ─────────────────────────────────────────────────────────────────────────────
function fetchTradingProfile(base_url, token, userKey, vuId, email) {
    const res = http.get(
        `${base_url}/user/api/v1/profile/trading`,
        { headers: getDefaultHeaders(token) }
    );

    if (res.status === 200) {
        const d = res.json().data;
        console.log(
            `   ✅ User ${userKey} (${email}) profile — ` +
            `user_id: ${d.user_id}, client_id: ${d.client_id}`
        );
        return {
            user_id:      d.user_id,
            client_id:    d.client_id,
            SID:          d.sid,
            ksei_acc_no:  d.ksei_acc_no,
            account_name: d.account_name,
        };
    }

    console.error(
        `   ❌ User ${userKey} (${email}, VU${vuId}) trading profile FAILED — Status: ${res.status}`
    );
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────────────────────────
// Runs once before the test. Logs in all users and collects tokens.
// Returns { base_url, tokens, vuMapping } consumed by every VU.
//
// tokens structure per userKey:
//   {
//     email, bp,
//     token,        ← session token  (null if skipSetupLogin or login failed)
//     pin_token,    ← PIN token      (null if skipped or failed)
//     user_id, client_id, SID, ksei_acc_no, account_name
//   }
//
// vuMapping structure:
//   { [vuId]: { bp, userKey } }
//   Used by BP functions to resolve which user/token belongs to the current VU.
// ─────────────────────────────────────────────────────────────────────────────
export function setup() {
    const base_url = getBaseUrl();
    const tokens   = {};    // keyed by userKey (global user number)
    const vuMapping = {};   // keyed by vuId (1-based global VU index)

    // ── Counters ──────────────────────────────────────────────────────────────
    let totalSkipped      = 0;
    let totalLoginOK      = 0;
    let totalLoginFail    = 0;
    let totalLoginRetries = 0;
    let totalPinOK        = 0;
    let totalPinFail      = 0;
    let totalProfileOK    = 0;
    let totalProfileFail  = 0;

    console.log(`\n🚀 Setup starting — ${TOTAL_USER} users across ${selectedBPs.length} BP(s)`);
    console.log(`   Platform  : ${platform}`);
    console.log(`   Batch size: ${BATCH_SIZE} | Batch delay: ${BATCH_DELAY}s`);
    console.log(`   Max retry : ${MAX_RETRY_ATTEMPTS} | Retry delay: ${RETRY_DELAY}s`);
    console.log(`   Mode      : ${isMultiBP ? 'Multi-BP (LoadTest)' : 'Single BP (Manual)'}\n`);

    // ── Build vuMapping first (needed by BPs to resolve their own user) ───────
    // VU IDs are 1-based and assigned sequentially across all BPs in order.
    let vuIdCursor = 1;
    selectedBPs.forEach(bp => {
        const count      = userDistribution[bp] || 0;
        const startUser  = numStarts[bp];

        for (let i = 0; i < count; i++) {
            const vuId   = vuIdCursor + i;
            const userKey = startUser + i;
            vuMapping[vuId] = { bp, userKey };
        }
        vuIdCursor += count;
    });

    // ── Per-BP login loop ─────────────────────────────────────────────────────
    let globalVuOffset = 1; // tracks the first VU ID for the current BP

    selectedBPs.forEach(bp => {
        const count          = userDistribution[bp] || 0;
        const startUser      = numStarts[bp];
        const bpCfg          = BP_CONFIG[platform]?.[bp] ?? {};
        const skipLogin      = bpCfg.skipSetupLogin === true;

        console.log(`\n📦 [${bp}] ${count} users | VU ${globalVuOffset}–${globalVuOffset + count - 1} | numStart: ${startUser}`);

        // ── skipSetupLogin: assign email only, no HTTP calls ─────────────────
        if (skipLogin) {
            console.log(`   ⏩ skipSetupLogin=true — BP will login per iteration`);

            for (let i = 0; i < count; i++) {
                const userKey    = startUser + i;
                const credentials = getUserCredentials(i + 1, startUser - 1);

                tokens[userKey] = {
                    email:        credentials.email,
                    bp,
                    token:        null,
                    pin_token:    null,
                    user_id:      null,
                    client_id:    null,
                    SID:          null,
                    ksei_acc_no:  null,
                    account_name: null,
                };
                totalSkipped++;
            }

            globalVuOffset += count;
            return; // next BP
        }

        // ── Full login flow (batched) ─────────────────────────────────────────
        const numBatches = Math.ceil(count / BATCH_SIZE);

        for (let batchIdx = 0; batchIdx < numBatches; batchIdx++) {
            const batchFrom = batchIdx * BATCH_SIZE;
            const batchTo   = Math.min(batchFrom + BATCH_SIZE, count);

            console.log(`   📦 Batch ${batchIdx + 1}/${numBatches}: users ${startUser + batchFrom}–${startUser + batchTo - 1}`);

            for (let i = batchFrom; i < batchTo; i++) {
                const userKey    = startUser + i;
                const vuId       = globalVuOffset + i;
                const credentials = getUserCredentials(i + 1, startUser - 1);

                // ── STEP 1: Login ─────────────────────────────────────────────
                const loginResult = loginWithRetry(base_url, credentials, userKey, vuId);

                if (!loginResult.success) {
                    totalLoginFail++;
                    totalLoginRetries += loginResult.attempts - 1;

                    tokens[userKey] = {
                        email:     credentials.email,
                        bp,
                        token:        null,
                        pin_token:    null,
                        user_id:      null,
                        client_id:    null,
                        SID:          null,
                        ksei_acc_no:  null,
                        account_name: null,
                    };
                    continue; // skip PIN + profile for this user
                }

                totalLoginOK++;
                if (loginResult.attempts > 1) totalLoginRetries += loginResult.attempts - 1;

                const { token } = loginResult;

                // ── STEP 2: PIN Login ─────────────────────────────────────────
                const pin_token = fetchPinToken(base_url, token, userKey, vuId, credentials.email);
                if (pin_token) totalPinOK++;
                else           totalPinFail++;

                // ── STEP 3: Trading Profile ───────────────────────────────────
                const profile = fetchTradingProfile(base_url, token, userKey, vuId, credentials.email);
                if (profile) totalProfileOK++;
                else         totalProfileFail++;

                // ── Store token data ──────────────────────────────────────────
                tokens[userKey] = {
                    email:        credentials.email,
                    bp,
                    token,
                    pin_token,
                    user_id:      profile?.user_id      ?? null,
                    client_id:    profile?.client_id    ?? null,
                    SID:          profile?.SID          ?? null,
                    ksei_acc_no:  profile?.ksei_acc_no  ?? null,
                    account_name: profile?.account_name ?? null,
                };
            }

            console.log(`   ✅ Batch ${batchIdx + 1}/${numBatches} done`);

            if (batchIdx < numBatches - 1) sleep(BATCH_DELAY);
        }

        globalVuOffset += count;
    });

    // ── Summary ───────────────────────────────────────────────────────────────
    const loginTotal = TOTAL_USER - totalSkipped;

    console.log('\n📊 Setup Summary:');
    if (totalSkipped > 0) {
        console.log(`   ⏩ Skipped (self-login BP): ${totalSkipped}`);
    }
    if (loginTotal > 0) {
        console.log(`   Login   : ${totalLoginOK}/${loginTotal} OK (${pct(totalLoginOK, loginTotal)}%)`);
        if (totalLoginFail    > 0) console.error(`   ❌ Login failed : ${totalLoginFail}`);
        if (totalLoginRetries > 0) console.log(`   🔁 Login retries: ${totalLoginRetries} total`);
        console.log(`   PIN     : ${totalPinOK}/${loginTotal} OK (${pct(totalPinOK, loginTotal)}%)`);
        if (totalPinFail > 0) console.error(`   ❌ PIN failed   : ${totalPinFail}`);
        console.log(`   Profile : ${totalProfileOK}/${loginTotal} OK (${pct(totalProfileOK, loginTotal)}%)`);
        if (totalProfileFail > 0) console.error(`   ❌ Profile failed: ${totalProfileFail}`);
    }

    console.log('\n📋 Per-BP Summary:');
    selectedBPs.forEach(bp => {
        const bpCfg   = BP_CONFIG[platform]?.[bp] ?? {};
        const skipped = bpCfg.skipSetupLogin === true;
        const bpToks  = Object.values(tokens).filter(t => t.bp === bp);

        if (skipped) {
            console.log(`   ${bp}: ⏩ login skipped — ${bpToks.length} users assigned`);
        } else {
            const logins   = bpToks.filter(t => t.token     !== null).length;
            const pins     = bpToks.filter(t => t.pin_token !== null).length;
            const profiles = bpToks.filter(t => t.user_id   !== null).length;
            console.log(`   ${bp}: ${logins}/${bpToks.length} logins | ${pins}/${bpToks.length} PINs | ${profiles}/${bpToks.length} profiles`);
        }
    });

    console.log('\n🎉 Setup complete!\n');

    return { base_url, tokens, vuMapping };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE SUMMARY — HTML + stdout report
// ─────────────────────────────────────────────────────────────────────────────
export function handleSummary(data) {
    try {
        // Ensure required metric keys exist to prevent report errors
        if (!data.metrics.data_received) {
            data.metrics.data_received = { values: { count: 0, rate: 0 } };
        }
        if (!data.metrics.data_sent) {
            data.metrics.data_sent = { values: { count: 0, rate: 0 } };
        }

        const now     = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        const runby   = __ENV.RUNBY || 'Manual';

        // Derive a readable BP name for the report filename
        let bp_name;
        if (selectedBPs.length === 1) {
            bp_name = selectedBPs[0];
        } else {
            const nums  = selectedBPs
                .map(x => parseInt(x.replace('BP', '')))
                .filter(x => !isNaN(x))
                .sort((a, b) => a - b);
            const min   = String(nums[0]).padStart(3, '0');
            const max   = String(nums[nums.length - 1]).padStart(3, '0');
            bp_name     = `BP${min}-BP${max}`;
        }

        const reportDirs = {
            Manual:     `../../Report/Growin_Ratelimit_Reset_Password/${platform}/${bp_name}/Manual`,
            Regression: `../../Report/Growin_Ratelimit_Reset_Password/${platform}/${bp_name}/Regression`,
            LoadTest:   `../../Report/Growin_Ratelimit_Reset_Password/${platform}/LoadTest`,
        };

        const dir      = reportDirs[runby] ?? reportDirs.Manual;
        const htmlPath = `${dir}/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;

        console.log(`📄 Generating report: ${htmlPath}`);

        return {
            [htmlPath]: htmlReport(data),
            stdout:     textSummary(data, { indent: ' ', enableColors: true }),
        };

    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`   Stack: ${error.stack}`);

        return {
            stdout: textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function pct(part, total) {
    return total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';
}