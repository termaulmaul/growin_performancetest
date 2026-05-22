// Command
// Run Multiple BP
// ../../../k6 run ExaCC_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 -e PLATFORM=Web  --out dashboard=export=../../../Report/ExaCC/Web/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP Web
// ../../k6 run ExaCC.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP001/Manual/Manual_DryRun_0506_1353_BP001.html
// ../../k6 run ExaCC.js -e RUNBY=Manual -e ENV=INT -e USER=200 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Web --out dashboard=export=../../Report/ExaCC/Web/BP002/Manual/Manual_DryRun_0506_1409_BP002.html

// Run Single BP iOS
// ../../k6 run ExaCC.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/ExaCC/iOS/BP001/Manual/Manual_DryRun_0428_1403_BP001.html

// Run Single BP Android
// ../../k6 run ExaCC.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/ExaCC/Android/BP001/Manual/Manual_DryRun_0428_1100_BP001.html

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';

// ─── IMPORTS WEB ──────────────────────────────────────────────────────────────
import { BP001 as BP001_Web } from "./Web/BP001.js";
import { BP002 as BP002_Web } from "./Web/BP002.js";
import { BP003 as BP003_Web } from "./Web/BP003.js";
import { BP004 as BP004_Web } from "./Web/BP004.js";
import { BP005 as BP005_Web } from "./Web/BP005.js";
import { BP006 as BP006_Web } from "./Web/BP006.js";
import { BP007 as BP007_Web } from "./Web/BP007.js";
import { BP008 as BP008_Web } from "./Web/BP008.js";
import { BP009 as BP009_Web } from "./Web/BP009.js";
import { BP010 as BP010_Web } from "./Web/BP010.js";

// ─── IMPORTS iOS ──────────────────────────────────────────────────────────────
// import { BP001 as BP001_iOS } from "./iOS/BP001.js";
// import { BP002 as BP002_iOS } from "./iOS/BP002.js";

// ─── IMPORTS Android ─────────────────────────────────────────────────────────
// import { BP001 as BP001_Android } from "./Android/BP001.js";
// import { BP002 as BP002_Android } from "./Android/BP002.js";

import http from "k6/http";
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

// ─── BP CONFIG ────────────────────────────────────────────────────────────────
// skipSetupLogin: true  → BP login sendiri per-iterasi, setup() hanya assign email
// skipSetupLogin: false → setup() login seperti biasa dan pass token ke BP
// numStart tidak lagi di-hardcode di sini — dihitung otomatis secara kumulatif
//   berdasarkan userDistribution saat multi-BP (LoadTest), atau pakai NUMSTART env
//   saat single BP (Manual).
const BP_CONFIG = {
    Web: {
        BP001: { fn: BP001_Web, skipSetupLogin: false },
        BP002: { fn: BP002_Web, skipSetupLogin: false },
        BP003: { fn: BP003_Web, skipSetupLogin: false },
        BP004: { fn: BP004_Web, skipSetupLogin: false },
        BP005: { fn: BP005_Web, skipSetupLogin: false },
        BP006: { fn: BP006_Web, skipSetupLogin: false },
        BP007: { fn: BP007_Web, skipSetupLogin: false },
        BP008: { fn: BP008_Web, skipSetupLogin: false },
        BP009: { fn: BP009_Web, skipSetupLogin: false },
        BP010: { fn: BP010_Web, skipSetupLogin: false },
        // BP002: { fn: BP002_Web, skipSetupLogin: false },
    },
    // iOS: {
    //     BP001: { fn: BP001_iOS, skipSetupLogin: true  },
    //     BP002: { fn: BP002_iOS, skipSetupLogin: false },
    // },
    // Android: {
    //     BP001: { fn: BP001_Android, skipSetupLogin: false },
    //     BP002: { fn: BP002_Android, skipSetupLogin: false },
    // },
};

// ─── BP MAP (derived from BP_CONFIG, no changes needed below) ────────────────
const BP_MAP = Object.fromEntries(
    Object.entries(BP_CONFIG).map(([plt, bps]) => [
        plt,
        Object.fromEntries(Object.entries(bps).map(([bp, cfg]) => [bp, cfg.fn]))
    ])
);

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
function dispatch(bpName, data) {
    const fn = BP_MAP[platform]?.[bpName];
    if (!fn) throw new Error(`❌ ${bpName} not found for platform: ${platform}`);
    return fn(data);
}

// ─── EXPORTS (tambah baris baru di sini setiap ada BP baru) ──────────────────
export function BP001(data) { return dispatch('BP001', data); }
export function BP002(data) { return dispatch('BP002', data); }
export function BP003(data) { return dispatch('BP003', data); }
export function BP004(data) { return dispatch('BP004', data); }
export function BP005(data) { return dispatch('BP005', data); }
export function BP006(data) { return dispatch('BP006', data); }
export function BP007(data) { return dispatch('BP007', data); }
export function BP008(data) { return dispatch('BP008', data); }
export function BP009(data) { return dispatch('BP009', data); }
export function BP010(data) { return dispatch('BP010', data); }
// export function BP002(data) { return dispatch('BP002', data); }

// ✅ RETRY CONFIGURATION
// const MAX_RETRY_ATTEMPTS = 10;
// const RETRY_DELAY = 1; // seconds between retry attempts

const BP_USER_PERCENTAGE = {
    BP001: 21.98,
    BP002: 19.18,
    BP003: 10.23,
    BP004: 10.23,
    BP005: 9.54,
    BP006: 7.57,
    BP007: 6.38,
    BP008: 5.91,
    BP009: 5.36,
    BP010: 3.62,
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

// ✅ Function untuk calculate numStart per BP secara kumulatif
// Multi-BP (LoadTest): setiap BP melanjutkan dari angka terakhir BP sebelumnya
// Single BP (Manual) : semua pakai NUMSTART dari env langsung (behaviour tidak berubah)
function calculateNumStarts(selectedBPs, userDistribution, baseStart) {
    const numStarts = {};
    let cursor = baseStart;
    selectedBPs.forEach(bp => {
        numStarts[bp] = cursor;
        cursor += (userDistribution[bp] || 0);
    });
    return numStarts;
}

const { SCENARIO } = __ENV;
const TOTAL_USER = parseInt(__ENV.TOTAL_USER) || parseInt(__ENV.USER) || 100;
const NUMSTART_env = parseInt(__ENV.NUMSTART) || 1;

let selectedBPs = [];
if (SCENARIO) {
    // ✅ Single/specific BP run: pakai SCENARIO dari env (misal -e SCENARIO=BP001 atau -e SCENARIO=BP001,BP002)
    selectedBPs = SCENARIO.split(',').map(s => s.trim());
} else {
    // ✅ LoadTest / tanpa SCENARIO: ambil semua BP yang terdaftar di BP_CONFIG untuk platform ini
    //    Ini memastikan hanya BP yang sesuai platform yang jalan, bukan semua BP di BP_USER_PERCENTAGE
    const platformBPs = Object.keys(BP_CONFIG[platform] || {});
    if (platformBPs.length === 0) {
        console.error(`❌ Tidak ada BP yang terdaftar untuk platform: ${platform}`);
    }
    selectedBPs = platformBPs;
}

const isMultiBP = selectedBPs.length > 1;

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

// ✅ Hitung numStart per BP:
//    - Multi-BP: kumulatif, setiap BP lanjut dari user terakhir BP sebelumnya
//    - Single BP: semua pakai NUMSTART dari env (tidak ada perubahan behaviour)
const BP_NUM_STARTS = isMultiBP
    ? calculateNumStarts(selectedBPs, userDistribution, NUMSTART_env)
    : Object.fromEntries(selectedBPs.map(bp => [bp, NUMSTART_env]));

console.log('📊 User Distribution:');
Object.keys(userDistribution).forEach(bp => {
    const start = BP_NUM_STARTS[bp];
    const count = userDistribution[bp];
    console.log(`   ${bp}: ${count} users (${BP_USER_PERCENTAGE[bp]}%) → user #${start} to #${start + count - 1}`);
});
console.log(`   TOTAL: ${TOTAL_USER} users`);
console.log(`   PLATFORM: ${platform}`);
console.log(`   MODE: ${isMultiBP ? 'Multi-BP (LoadTest) — numStart kumulatif per BP' : 'Single BP (Manual) — NUMSTART dari env'}`);

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
 
        // console.log(`Response Body: ${loginRes.body}`)
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
            console.warn(`   ⚠️  User ${userKey} (${credentials.email}, VU${vuId}) LOGIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${loginRes.status} | Body: ${loginRes.body}, retrying...`);
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
    console.log(`🔢 Mode: ${isMultiBP ? 'Multi-BP (LoadTest) — numStart kumulatif per BP' : 'Single BP (Manual) — pakai NUMSTART dari env'}`);
    
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    let totalUserIdSuccess = 0;
    let totalUserIdFailed = 0;
    let totalLoginRetries = 0;
    // ✅ counter untuk BP yang skip setup login
    let totalSkippedLogin = 0;
    
    selectedBPs.forEach((bp, bpIndex) => {
        const usersForThisBP = userDistribution[bp];

        // ✅ Ambil config per-BP
        const bpConfig = BP_CONFIG[platform]?.[bp] ?? {};
        const skipSetupLogin = bpConfig.skipSetupLogin === true;

        // ✅ Pakai BP_NUM_STARTS yang sudah dihitung di atas (kumulatif untuk multi-BP,
        //    atau NUMSTART env untuk single BP). globalUserOffset diturunkan dari sana.
        const bpNumStart = BP_NUM_STARTS[bp];
        const globalUserOffset = bpNumStart - NUMSTART_env;

        console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        console.log(`   🔢 numStart efektif: ${bpNumStart} (user #${bpNumStart} to #${bpNumStart + usersForThisBP - 1})`);

        if (skipSetupLogin) {
            console.log(`   ⏩ skipSetupLogin=true: setup login di-skip untuk ${bp}, BP akan login sendiri per-iterasi`);
        }
        
        for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
            const vuId = globalVuOffset + localUserIndex - 1;
            vuMapping[vuId] = {
                bp: bp,
                userKey: globalUserOffset + localUserIndex
            };
        }
        
        // ✅ Jika skipSetupLogin, assign hanya email — skip semua HTTP call
        if (skipSetupLogin) {
            for (let i = 1; i <= usersForThisBP; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey = globalUserOffset + i;
                tokens[userKey] = {
                    email: credentials.email,
                    token: null,
                    pin_token: null,
                    user_id: null,
                    client_id: null,
                    SID: null,
                    ksei_acc_no: null,
                    account_name: null,
                    bp: bp,
                };
                totalSkippedLogin++;
            }
            globalVuOffset += usersForThisBP;
            return; // lanjut ke BP berikutnya
        }

        // ─── Logic login original (tidak diubah) ──────────────────────────────
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
        
        globalVuOffset += usersForThisBP;
        // ✅ globalUserOffset TIDAK diakumulasi di sini — setiap BP menghitung offsetnya
        //    sendiri dari BP_NUM_STARTS di awal forEach, sehingga setiap BP
        //    selalu mulai dari nomor user yang benar terlepas dari urutan BP lainnya.
    });
    
    console.log(`\n📊 Setup Summary:`);

    // ✅ tampilkan info BP yang skip login
    if (totalSkippedLogin > 0) {
        console.log(`   ⏩ Skipped (self-login BP): ${totalSkippedLogin} users`);
    }

    const loginTotal = TOTAL_USER - totalSkippedLogin;
    if (loginTotal > 0) {
        console.log(`   ✅ Login: ${totalLoginSuccess}/${loginTotal} success (${((totalLoginSuccess/loginTotal)*100).toFixed(1)}%)`);
        if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
        if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries} total retry attempts`);
        
        console.log(`   ✅ PIN: ${totalPinSuccess}/${loginTotal} success (${((totalPinSuccess/loginTotal)*100).toFixed(1)}%)`);
        if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    }
    
    console.log(`\n📋 Per-BP Summary:`);
    selectedBPs.forEach(bp => {
        const bpConfig = BP_CONFIG[platform]?.[bp] ?? {};
        const skipSetupLogin = bpConfig.skipSetupLogin === true;
        const bpTokens = Object.values(tokens).filter(t => t.bp === bp);

        if (skipSetupLogin) {
            console.log(`   ${bp}: ⏩ login skipped (self-login per-iteration) — ${bpTokens.length} users assigned`);
        } else {
            const logins = bpTokens.filter(t => t.token !== null).length;
            const pins = bpTokens.filter(t => t.pin_token !== null).length;
            console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs`);
        }
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
            const htmlPath = `../../Report/ExaCC/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'Regression') {
            const htmlPath = `../../Report/ExaCC/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'LoadTest') {
            const htmlPath = `../../Report/ExaCC/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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