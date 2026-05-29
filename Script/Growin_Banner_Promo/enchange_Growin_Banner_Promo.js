// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Banner_Promo/Growin_Banner_Promo.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

// Command
// Run Multiple BP
// ../../../k6 run Growin_Banner_Promo_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Banner_Promo/Web/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP Web
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP001/Manual/Manual_DryRun_0511_1443_BP001.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP002/Manual/Manual_DryRun_0413_1448_BP002.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP003 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP003/Manual/Manual_DryRun_0414_1719_BP003.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP004 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP004/Manual/Manual_DryRun_0415_1007_BP004.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP005 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP005/Manual/Manual_DryRun_0414_1644_BP005.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP006 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP006/Manual/Manual_DryRun_0414_1654_BP006.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP007 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP007/Manual/Manual_DryRun_0414_1720_BP007.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP008 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP008/Manual/Manual_DryRun_0414_1701_BP008.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP009 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP009/Manual/Manual_DryRun_0414_1710_BP009.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP010 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP010/Manual/Manual_DryRun_0414_1708_BP010.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP011 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP011/Manual/Manual_DryRun_0414_1719_BP011.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP012 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP012/Manual/Manual_DryRun_0414_1708_BP012.html
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP013 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Banner_Promo/Web/BP013/Manual/Manual_DryRun_0414_1709_BP013.html

// Run Single BP iOS
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Banner_Promo/iOS/BP001/Manual/Manual_DryRun_0511_1547_BP001.html

// Run Single BP Android
// ../../k6 run Growin_Banner_Promo.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Banner_Promo/Android/BP001/Manual/Manual_DryRun_0428_1100_BP001.html

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';

// ─── IMPORTS WEB ──────────────────────────────────────────────────────────────
import { BP001 as BP001_Web } from "./Web/BP001.js";
// import { BP002 as BP002_Web } from "./Web/BP002.js";
// import { BP003 as BP003_Web } from "./Web/BP003.js";
// import { BP004 as BP004_Web } from "./Web/BP004.js";
// import { BP005 as BP005_Web } from "./Web/BP005.js";
// import { BP006 as BP006_Web } from "./Web/BP006.js";
// import { BP007 as BP007_Web } from "./Web/BP007.js";
// import { BP008 as BP008_Web } from "./Web/BP008.js";
// import { BP009 as BP009_Web } from "./Web/BP009.js";
// import { BP010 as BP010_Web } from "./Web/BP010.js";
// import { BP011 as BP011_Web } from "./Web/BP011.js";
// import { BP012 as BP012_Web } from "./Web/BP012.js";
// import { BP013 as BP013_Web } from "./Web/BP013.js";

// ─── IMPORTS iOS ──────────────────────────────────────────────────────────────
import { BP001 as BP001_iOS } from "./iOS/BP001.js";
// import { BP002 as BP002_iOS } from "./iOS/BP002.js";
// import { BP003 as BP003_iOS } from "./iOS/BP003.js";
// import { BP004 as BP004_iOS } from "./iOS/BP004.js";
// import { BP005 as BP005_iOS } from "./iOS/BP005.js";
// import { BP006 as BP006_iOS } from "./iOS/BP006.js";
// import { BP007 as BP007_iOS } from "./iOS/BP007.js";
// import { BP008 as BP008_iOS } from "./iOS/BP008.js";
// import { BP009 as BP009_iOS } from "./iOS/BP009.js";
// import { BP010 as BP010_iOS } from "./iOS/BP010.js";
// import { BP011 as BP011_iOS } from "./iOS/BP011.js";
// import { BP012 as BP012_iOS } from "./iOS/BP012.js";
// import { BP013 as BP013_iOS } from "./iOS/BP013.js";

// ─── IMPORTS Android ─────────────────────────────────────────────────────────
// import { BP001 as BP001_Android } from "./Android/BP001.js";
// import { BP002 as BP002_Android } from "./Android/BP002.js";
// import { BP003 as BP003_Android } from "./Android/BP003.js";
// import { BP004 as BP004_Android } from "./Android/BP004.js";
// import { BP005 as BP005_Android } from "./Android/BP005.js";
// import { BP006 as BP006_Android } from "./Android/BP006.js";
// import { BP007 as BP007_Android } from "./Android/BP007.js";
// import { BP008 as BP008_Android } from "./Android/BP008.js";
// import { BP009 as BP009_Android } from "./Android/BP009.js";
// import { BP010 as BP010_Android } from "./Android/BP010.js";
// import { BP011 as BP011_Android } from "./Android/BP011.js";
// import { BP012 as BP012_Android } from "./Android/BP012.js";
// import { BP013 as BP013_Android } from "./Android/BP013.js";

import http from "k6/http";
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.
http.setResponseCallback(http.expectedStatuses(200, 201, 400, 401, 403, 404, 500));
import { sleep } from "k6";
import { Rate } from "k6/metrics";

const DEFAULT_PARAMS = {
    timeout: '300s',
};

function getPlatform() {
    const { PLATFORM } = __ENV;
    
    if (PLATFORM && ['Android', 'iOS', 'Web'].includes(PLATFORM)) {
        return PLATFORM;
    }
    
    console.error('❌ PLATFORM must be specified: Android, iOS or Web');
    console.error('   Example: -e PLATFORM=Android, -e PLATFORM=iOS, -e PLATFORM=Web');
    return 'Web'; // default fallback
}

const platform = getPlatform();

// ─── BP MAP ───────────────────────────────────────────────────────────────────
const BP_MAP = {
    Web:     { BP001: BP001_Web     /* BP002: BP002_Web, BP003: BP003_Web, ... */ },
    iOS:     { BP001: BP001_iOS     /* BP002: BP002_iOS, BP003: BP003_iOS, ... */ },
    // Android: { BP001: BP001_Android /* BP002: BP002_Android, BP003: BP003_Android, ... */ },
};

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
function dispatch(bpName, data) {
    const fn = BP_MAP[platform]?.[bpName];
    if (!fn) throw new Error(`❌ ${bpName} not found for platform: ${platform}`);
    return fn(data);
}

// ─── EXPORTS (tambah baris baru di sini setiap ada BP baru) ──────────────────
export function BP001(data) { return dispatch('BP001', data); }
// export function BP002(data) { return dispatch('BP002', data); }
// export function BP003(data) { return dispatch('BP003', data); }
// export function BP004(data) { return dispatch('BP004', data); }
// export function BP005(data) { return dispatch('BP005', data); }
// export function BP006(data) { return dispatch('BP006', data); }
// export function BP007(data) { return dispatch('BP007', data); }
// export function BP008(data) { return dispatch('BP008', data); }
// export function BP009(data) { return dispatch('BP009', data); }
// export function BP010(data) { return dispatch('BP010', data); }
// export function BP011(data) { return dispatch('BP011', data); }
// export function BP012(data) { return dispatch('BP012', data); }
// export function BP013(data) { return dispatch('BP013', data); }

// ✅ RETRY CONFIGURATION
// const MAX_RETRY_ATTEMPTS = 10;
// const RETRY_DELAY = 1; // seconds between retry attempts

const BP_USER_PERCENTAGE = {
    BP001: 100,
    // BP002: 2.63,
    // BP003: 16.28,
    // BP004: 11.25,
    // BP005: 1.69,
    // BP006: 7.5,
    // BP007: 1.31,
    // BP008: 18.75,
    // BP009: 2.34,
    // BP010: 7.5,
    // BP011: 0.56,
    // BP012: 3.75,
    // BP013: 0.19,
};

// ✅ Function untuk calculate user distribution
function calculateUserDistribution(totalUsers, selectedBPs) {
    const distribution = {};
    let totalPercentage = 0;
    
    selectedBPs.forEach(bp => {
        totalPercentage += BP_USER_PERCENTAGE[bp] || 0;
    });
    
    if (totalPercentage === 0) {
        console.error('❌ No valid BP selected or percentage not defined!');
        return distribution;
    }
    
    let allocatedUsers = 0;
    selectedBPs.forEach((bp, index) => {
        const percentage = BP_USER_PERCENTAGE[bp];
        
        if (index === selectedBPs.length - 1) {
            distribution[bp] = totalUsers - allocatedUsers;
        } else {
            const users = Math.floor((percentage / totalPercentage) * totalUsers);
            distribution[bp] = users;
            allocatedUsers += users;
        }
    });
    
    return distribution;
}

const { SCENARIO } = __ENV;
const TOTAL_USER = parseInt(__ENV.TOTAL_USER) || parseInt(__ENV.USER) || 100;

let selectedBPs = [];
if (SCENARIO) {
    selectedBPs = SCENARIO.split(',').map(s => s.trim());
} else {
    selectedBPs = Object.keys(BP_USER_PERCENTAGE);
}

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

console.log('📊 User Distribution:');
Object.keys(userDistribution).forEach(bp => {
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_USER_PERCENTAGE[bp]}%)`);
});
console.log(`   TOTAL: ${TOTAL_USER} users`);
console.log(`   PLATFORM: ${platform}`);

const scenarios = {};
selectedBPs.forEach(bp => {
    scenarios[bp] = {
        // executor: 'per-vu-iterations',
        // vus: 1,
        // iterations: 1,
        // maxDuration: '1h',

        // executor: 'ramping-vus',
        // startVUs: 0,
        // stages: [
        //     { duration: '5m', target: 100 },
        //     { duration: '10m', target: 100 },
        //     { duration: '5m', target: 200 },
        //     { duration: '10m', target: 200 },
        //     { duration: '5m', target: 300 },
        //     { duration: '10m', target: 300 },
        //     { duration: '5m', target: 400 },
        //     { duration: '10m', target: 400 },

        //     { duration: '5m', target: 500 },
        //     { duration: '10m', target: 500 },
        //     { duration: '5m', target: 600 },
        //     { duration: '10m', target: 600 },
        //     { duration: '5m', target: 700 },
        //     { duration: '10m', target: 700 },
        //     { duration: '5m', target: 800 },
        //     { duration: '10m', target: 800 },

        //     { duration: '5m', target: 900 },
        //     { duration: '10m', target: 900 },
        //     { duration: '5m', target: 1000 },
        //     { duration: '10m', target: 1000 },
        //     { duration: '5m', target: 1100 },
        //     { duration: '10m', target: 1100 },
        //     { duration: '5m', target: 1200 },
        //     { duration: '10m', target: 1200 },

        //     { duration: '5m', target: 1300 },
        //     { duration: '10m', target: 1300 },
        //     { duration: '5m', target: 1400 },
        //     { duration: '10m', target: 1400 },
        //     { duration: '5m', target: 1500 },
        //     { duration: '10m', target: 1500 },
        //     { duration: '5m', target: 1600 },
        //     { duration: '10m', target: 1600 },

        //     { duration: '5m', target: 1700 },
        //     { duration: '10m', target: 1700 },
        //     { duration: '5m', target: 1800 },
        //     { duration: '10m', target: 1800 },
        //     { duration: '5m', target: 1900 },
        //     { duration: '10m', target: 1900 },
        //     { duration: '5m', target: 2000 },
        //     { duration: '10m', target: 2000 },
        //     { duration: '5m', target: 0 },
        // ],

        executor: 'constant-vus',
        vus: userDistribution[bp] || 1,
        duration: `${__ENV.DURATION}`,

        gracefulStop: '30s',
        exec: bp,
    };
});

export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
    // httpDebug: 'full',
};

// ✅ LOGIN WITH RETRY — uses MAX_RETRY_ATTEMPTS & RETRY_DELAY from Helper/config.js
function loginWithRetry(base_url, credentials, userKey, vuId) {
    const loginPayload = JSON.stringify({
        password: credentials.password,
        email: credentials.email,
        recaptcha: '',
    });
 
    const loginHeaders = getDefaultHeaders();
 
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
 
        if (loginRes.status === 200) {
            if (attempt > 1) {
                console.log(`   ✅ User ${userKey} (${credentials.email}, VU${vuId}) LOGIN SUCCESS on attempt ${attempt}`);
            }
            return {
                success: true,
                token: loginRes.json().data.token,
                attempts: attempt
            };
        }
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(`   ⚠️  User ${userKey} (${credentials.email}, VU${vuId}) LOGIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${loginRes.status}, retrying...`);
            sleep(RETRY_DELAY);
        } else {
            console.error(`   ❌ User ${userKey} (${credentials.email}, VU${vuId}) LOGIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts - Status: ${loginRes.status}`);
        }
    }
    
    return { success: false, token: null, attempts: MAX_RETRY_ATTEMPTS };
}
 
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔁 Retry enabled: Max ${MAX_RETRY_ATTEMPTS} attempts per login`);
    console.log(`🔑 ALL users will get PIN token`);
    console.log(`📱 Platform: ${platform}`);
    
    let globalUserOffset = 0;
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    let totalUserIdSuccess = 0;
    let totalUserIdFailed = 0;
    let totalLoginRetries = 0;
    
    selectedBPs.forEach((bp, bpIndex) => {
        const usersForThisBP = userDistribution[bp];
        
        console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
        for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
            const vuId = globalVuOffset + localUserIndex - 1;
            vuMapping[vuId] = {
                bp: bp,
                userKey: globalUserOffset + localUserIndex
            };
        }
        
        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE + 1;
            const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey = globalUserOffset + i;
                const vuId = globalVuOffset + i - 1;
                
                const loginResult = loginWithRetry(base_url, credentials, userKey, vuId);
                
                if (loginResult.success) {
                    totalLoginSuccess++;
                    if (loginResult.attempts > 1) {
                        totalLoginRetries += (loginResult.attempts - 1);
                    }
                    
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: loginResult.token,
                        pin_token: null,
                        bp: bp
                    };
 
                    const profileHeaders = getDefaultHeaders(loginResult.token);
 
                    const profileUrls = [base_url + `/user/api/v1/profile/trading`];
                    const profileRequests = [['GET', profileUrls[0], null, { headers: profileHeaders }]];
                    const profileResponses = http.batch(profileRequests);
 
                    if (profileResponses[0].status == 200) {
                        totalUserIdSuccess++;
                        const tradingData = profileResponses[0].json().data;
                        
                        if (!tokens[userKey]) tokens[userKey] = {};
                        
                        tokens[userKey].user_id     = tradingData.user_id;
                        tokens[userKey].client_id   = tradingData.client_id;
                        tokens[userKey].SID         = tradingData.sid;
                        tokens[userKey].ksei_acc_no = tradingData.ksei_acc_no;
                        tokens[userKey].account_name = tradingData.account_name;
                        
                        console.log(`✅ Assigned - user_id: ${tokens[userKey].user_id}, client_id: ${tokens[userKey].client_id}`);
                    } else {
                        totalUserIdFailed++;
                        if (i === batchStart || totalUserIdFailed <= 5) {
                            console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) GET trading profile FAILED - Status: ${profileResponses[0].status} || Body: ${profileResponses[0].body}`);
                        }
                        tokens[userKey].user_id      = null;
                        tokens[userKey].client_id    = null;
                        tokens[userKey].SID          = null;
                        tokens[userKey].ksei_acc_no  = null;
                        tokens[userKey].account_name = null;
                    }
                    
                    const pinPayload = JSON.stringify({ value: "123456" });
                    const pinHeaders = getDefaultHeaders(loginResult.token);
 
                    const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
 
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
                } else {
                    totalLoginFailed++;
                    totalLoginRetries += (loginResult.attempts - 1);
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: null,
                        pin_token: null,
                        bp: bp
                    };
                }
            }
            
            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
            if (batchNum < numBatches - 1) {
                sleep(BATCH_DELAY);
            }
        }
        
        globalUserOffset += usersForThisBP;
        globalVuOffset += usersForThisBP;
    });
    
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login: ${totalLoginSuccess}/${TOTAL_USER} success (${((totalLoginSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
    if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
    if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries} total retry attempts`);
    
    console.log(`   ✅ PIN: ${totalPinSuccess}/${TOTAL_USER} success (${((totalPinSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
    if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    
    console.log(`\n📋 Per-BP Summary:`);
    selectedBPs.forEach(bp => {
        const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
        const logins = bpTokens.filter(t => t.token !== null).length;
        const pins = bpTokens.filter(t => t.pin_token !== null).length;
        
        console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs`);
    });
    
    console.log(`\n🎉 Setup completed!`);
    
    return { 
        base_url: base_url, 
        tokens: tokens,
        vuMapping: vuMapping,
    };
}

export function handleSummary(data) {
    try {
        if (!data.metrics.data_received) {
            data.metrics.data_received = { values: { count: 0, rate: 0 } };
        }
        if (!data.metrics.data_sent) {
            data.metrics.data_sent = { values: { count: 0, rate: 0 } };
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        
        const runby = __ENV.RUNBY || 'Manual';
        
        let bp_name = 'AllBP';
        
        if (selectedBPs.length === 1) {
            bp_name = selectedBPs[0];
        } else if (selectedBPs.length > 1) {
            const sortedBPs = [...selectedBPs].sort();
            
            const nums = sortedBPs.map(x => parseInt(x.replace('BP', '')))
                .filter(x => !isNaN(x))
                .sort((a, b) => a - b);
            
            if (nums.length > 0) {
                const min = String(nums[0]).padStart(3, '0');
                const max = String(nums[nums.length - 1]).padStart(3, '0');
                bp_name = `BP${min}-BP${max}`;
            }
        }
        
        console.log(`[${dateStr}_${timeStr}] Starting report generation for ${bp_name} on ${platform}...`);
        
        if (runby === 'Manual') {
            const htmlPath = `../../Report/Growin_Banner_Promo/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'Regression') {
            const htmlPath = `../../Report/Growin_Banner_Promo/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'LoadTest') {
            const htmlPath = `../../Report/Growin_Banner_Promo/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        }
        
    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        
        return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}