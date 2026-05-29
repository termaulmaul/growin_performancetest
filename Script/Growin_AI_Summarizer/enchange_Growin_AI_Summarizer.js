// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
// ENHANCE-P1: collapsed undefined BPxxx_Android refs to imported fallback. Original runner has live bug.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_AI_Summarizer/Growin_AI_Summarizer.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

// Command
// Run Multiple BP
// ../../../k6 run Growin_AI_Summarizer_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/Web/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP Web
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP001/Manual/Manual_DryRun_0421_1124_BP001.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP002/Manual/Manual_DryRun_0413_1448_BP002.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP003 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP003/Manual/Manual_DryRun_0414_1719_BP003.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP004 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP004/Manual/Manual_DryRun_0415_1007_BP004.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP005 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_0414_1644_BP005.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP006 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP006/Manual/Manual_DryRun_0414_1654_BP006.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP007 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP007/Manual/Manual_DryRun_0414_1720_BP007.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP008 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP008/Manual/Manual_DryRun_0414_1701_BP008.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP009 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP009/Manual/Manual_DryRun_0414_1710_BP009.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP010 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP010/Manual/Manual_DryRun_0414_1708_BP010.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP011 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP011/Manual/Manual_DryRun_0414_1719_BP011.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP012 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP012/Manual/Manual_DryRun_0414_1708_BP012.html
// ../../k6 run Growin_AI_Summarizer.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP013 -e PLATFORM=Web --out dashboard=export=../../Report/Growin_Community/Web/BP013/Manual/Manual_DryRun_0414_1709_BP013.html

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';
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
import { BP011 as BP011_Web } from "./Web/BP011.js";
import { BP012 as BP012_Web } from "./Web/BP012.js";
import { BP013 as BP013_Web } from "./Web/BP013.js";

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

// COMPAT: Android BPxxx not implemented; runner falls back to Web. Warn once per VU init.
if (platform === 'Android') {
  if (__ENV.STRICT_PLATFORM_IMPLEMENTATION === 'true') {
    throw new Error('[COMPAT] Android BP implementation missing. STRICT_PLATFORM_IMPLEMENTATION=true disables Web fallback.');
  }
  if (!globalThis.__ANDROID_WEB_FALLBACK_WARNED) {
    globalThis.__ANDROID_WEB_FALLBACK_WARNED = true;
    // COMPAT: Default keeps Web fallback to avoid breaking existing Jenkins Android jobs.
    // Set STRICT_PLATFORM_IMPLEMENTATION=true to fail fast when platform-specific BP is missing.
    console.warn('[COMPAT] PLATFORM=Android requested but Android BPxxx not imported; falling back to Web. Set STRICT_PLATFORM_IMPLEMENTATION=true to fail fast.');
  }
}

// Export BP yang tepat berdasarkan platform
export const BP001 = platform === 'Android' ? BP001_Web : BP001_Web;
export const BP002 = platform === 'Android' ? BP002_Web : BP002_Web;
export const BP003 = platform === 'Android' ? BP003_Web : BP003_Web;
export const BP004 = platform === 'Android' ? BP004_Web : BP004_Web;
export const BP005 = platform === 'Android' ? BP005_Web : BP005_Web;
export const BP006 = platform === 'Android' ? BP006_Web : BP006_Web;
export const BP007 = platform === 'Android' ? BP007_Web : BP007_Web;
export const BP008 = platform === 'Android' ? BP008_Web : BP008_Web;
export const BP009 = platform === 'Android' ? BP009_Web : BP009_Web;
export const BP010 = platform === 'Android' ? BP010_Web : BP010_Web;
export const BP011 = platform === 'Android' ? BP011_Web : BP011_Web;
export const BP012 = platform === 'Android' ? BP012_Web : BP012_Web;
export const BP013 = platform === 'Android' ? BP013_Web : BP013_Web;

// ✅ RETRY CONFIGURATION
// const MAX_RETRY_ATTEMPTS = 10;
// const RETRY_DELAY = 1; // seconds between retry attempts

const BP_USER_PERCENTAGE = {
    BP001: 26.25,
    BP002: 2.63,
    BP003: 16.28,
    BP004: 11.25,
    BP005: 1.69,
    BP006: 7.5,
    BP007: 1.31,
    BP008: 18.75,
    BP009: 2.34,
    BP010: 7.5,
    BP011: 0.56,
    BP012: 3.75,
    BP013: 0.19,
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
    // User bisa input: BP001 atau BP001,BP002
    selectedBPs = SCENARIO.split(',').map(s => s.trim());
} else {
    // Default: jalankan semua BP
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
        exec: bp, // akan memanggil BP001() atau BP002() sesuai export di atas
    };
});

// export const options = {
//     scenarios: scenarios,
//     noConnectionReuse: false,
//     setupTimeout: '3600s', // ✅ Increased for large user counts
//     teardownTimeout: '3600s',
//     summaryTimeUnit: '3600s',
// }
export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
    // httpDebug: 'full', // optional, untuk debug
};

// function getBaseUrl() {
//     if(`${__ENV.ENV}`=='DEV'){
//         return 'https://api-dev.growin.id';
//     } else if ((`${__ENV.ENV}`=='QA')) {
//         return 'https://api-qa.growin.id';
//     } else if (`${__ENV.ENV}`=='DRC') {
//         return 'https://drc-api.growin.id';
//     } else if (`${__ENV.ENV}`=='INT') {
//         return 'https://internal-api-pt.growin.id';
//     }
//     return 'https://internal-api-pt.growin.id';
//     // return 'https://financialsummarizer-pt.growin.id';
// }

// function getUserCredentials(userNum, bpOffset = 0) {
//     const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
//     const actualUserNum = userNum + bpOffset;
//     let email = '';
//     let formattedNum = '';
    
//     if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
//         formattedNum = String(startNum + actualUserNum - 1).padStart(3, '0');
//         email = 'mostng' + formattedNum + '@guysmail.com';
//     } else if (`${__ENV.ENV}`=='DRC') {
//         formattedNum = String(startNum + actualUserNum - 1).padStart(0, '0');
//         email = 'MOSTNG' + formattedNum + '@guysmail.com';
//     } else if (`${__ENV.ENV}`=='INT') {
//         formattedNum = String(startNum + actualUserNum - 1).padStart(2, '0');
//         email = 'TESTMON' + formattedNum + '@guysmail.com';
//     }
    
//     return { email: email, password: 'M@nsek.123' };
// }

// // ✅ LOGIN WITH RETRY - Max 10 attempts
// function loginWithRetry(base_url, credentials, userKey, vuId) {
//     const loginPayload = JSON.stringify({
//         password: credentials.password,
//         email: credentials.email,
//         recaptcha: '',
//     });

//     const loginHeaders = {
//         'Content-Type': 'application/json',
//         'Accept': '*/*',
//         'Accept-Language': 'en',
//         'Connection': 'keep-alive',
//         'Accept-Encoding': 'gzip, deflate, br',
//         'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
//         'X-App-Name': 'web',
//         'X-App-Version': '1.4.1',
//         'X-Device-Info': 'iPhone 11',
//         // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3'
//     };

//     for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
//         const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
//         // const loginRes = http.post('https://internal-api-pt.growin.id/auth/api/v1/login', loginPayload, { headers: loginHeaders });
//         if (loginRes.status === 200) {
//             if (attempt > 1) {
//                 console.log(`   ✅ User ${userKey} (${credentials.email}, VU${vuId}) LOGIN SUCCESS on attempt ${attempt}`);
//             }
//             return {
//                 success: true,
//                 token: loginRes.json().data.token,
//                 attempts: attempt
//             };
//         }
        
//         if (attempt < MAX_RETRY_ATTEMPTS) {
//             console.warn(`   ⚠️  User ${userKey} (${credentials.email}, VU${vuId}) LOGIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${loginRes.status}, retrying...`);
//             sleep(RETRY_DELAY);
//         } else {
//             console.error(`   ❌ User ${userKey} (${credentials.email}, VU${vuId}) LOGIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts - Status: ${loginRes.status}`);
//         }
//     }
    
//     return {
//         success: false,
//         token: null,
//         attempts: MAX_RETRY_ATTEMPTS
//     };
// }

// export function setup() {
//     const base_url = getBaseUrl();
//     const tokens = {};
//     const vuMapping = {};
    
//     const BATCH_SIZE = 500; // Process 500 users at a time
//     const BATCH_DELAY = 2; // 2 seconds between batches
    
//     console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
//     console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
//     console.log(`🔁 Retry enabled: Max ${MAX_RETRY_ATTEMPTS} attempts per login`);
//     console.log(`🔑 ALL users will get PIN token`);
//     console.log(`📱 Platform: ${platform}`);
    
//     let globalUserOffset = 0;
//     let globalVuOffset = 1;
    
//     let totalLoginSuccess = 0;
//     let totalLoginFailed = 0;
//     let totalPinSuccess = 0;
//     let totalPinFailed = 0;
//     let totalUserIdSuccess = 0;
//     let totalUserIdFailed = 0;
//     let totalLoginRetries = 0;
    
//     // ✅ Object untuk menyimpan channel_id per BP
//     const channelIds = {};
    
//     selectedBPs.forEach((bp, bpIndex) => {
//         const usersForThisBP = userDistribution[bp];
        
//         console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
//         // Create VU mapping
//         for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
//             const vuId = globalVuOffset + localUserIndex - 1;
//             vuMapping[vuId] = {
//                 bp: bp,
//                 userKey: globalUserOffset + localUserIndex
//             };
//         }
        
//         // ✅ Process in batches with retry
//         const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
//         for (let batchNum = 0; batchNum < numBatches; batchNum++) {
//             const batchStart = batchNum * BATCH_SIZE + 1;
//             const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
//             console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
//             for (let i = batchStart; i <= batchEnd; i++) {
//                 const credentials = getUserCredentials(i, globalUserOffset);
//                 const userKey = globalUserOffset + i;
//                 const vuId = globalVuOffset + i - 1;
                
//                 // ✅ Step 1: Login with retry
//                 const loginResult = loginWithRetry(base_url, credentials, userKey, vuId);
                
//                 if (loginResult.success) {
//                     totalLoginSuccess++;
//                     if (loginResult.attempts > 1) {
//                         totalLoginRetries += (loginResult.attempts - 1);
//                     }
                    
//                     tokens[userKey] = { 
//                         email: credentials.email, 
//                         token: loginResult.token,
//                         pin_token: null,
//                         bp: bp
//                     };


//                     // ✅ Step 3: Get userID (UNTUK SEMUA USER yang berhasil PIN)
//                     const profileHeaders = {
//                         'Cookie': `ACCESS_TOKEN=${loginResult.token};`,
//                         'Content-Type': 'application/json',
//                         'Accept': '*/*',
//                         'Accept-Language': 'en',
//                         'Connection': 'keep-alive',
//                         'Accept-Encoding': 'gzip, deflate, br',
//                         'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
//                         'X-App-Name': 'web',
//                         'X-App-Version': '1.4.1',
//                         'X-Device-Info': 'iPhone 11',
//                         'X-Device-Id': 'TEST3'
//                     };

//                     const profileUrls = [
//                         base_url + `/user/api/v1/profile/trading`
//                         // `https://internal-api-pt.growin.id/user/api/v1/profile/trading`
//                     ];

//                     const profileRequests = [
//                         ['GET', profileUrls[0], null, { headers: profileHeaders }],
//                     ];

//                     const profileResponses = http.batch(profileRequests);
//                     // console.log(profileResponses[0].body)

//                     // Handle profile/trading (index 0)
//                     // console.log(`LKJHGVHJBK ${profileResponses[0].status}`)
//                     if (profileResponses[0].status == 200) {
//                         totalUserIdSuccess++;
//                         const tradingData = profileResponses[0].json().data;
                        
//                         // Pastikan object-nya ada dulu sebelum assign
//                         if (!tokens[userKey]) {
//                             tokens[userKey] = {};
//                         }
                        
//                         tokens[userKey].user_id = tradingData.user_id;
//                         tokens[userKey].client_id = tradingData.client_id;
//                         tokens[userKey].SID = tradingData.sid;
//                         tokens[userKey].ksei_acc_no = tradingData.ksei_acc_no;
//                         tokens[userKey].account_name = tradingData.account_name;
                        
//                         // Verifikasi langsung setelah assign
//                         console.log(`✅ Assigned - user_id: ${tokens[userKey].user_id}, client_id: ${tokens[userKey].client_id}`);
//                     } else {
//                         totalUserIdFailed++;
//                         if (i === batchStart || totalUserIdFailed <= 5) {
//                             console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) GET trading profile FAILED - Status: ${profileResponses[0].status} || Body: ${profileResponses[0].body}`);
//                         }
//                         tokens[userKey].user_id = null;
//                         tokens[userKey].client_id = null;
//                         tokens[userKey].SID = null;
//                         tokens[userKey].ksei_acc_no = null;
//                         tokens[userKey].account_name = null;
//                     }
                    
//                     // ✅ Step 2: PIN Login (UNTUK SEMUA USER)
//                     const pinPayload = JSON.stringify({ value: "123456" });
//                     const pinHeaders = {
//                         'Content-Type': 'application/json',
//                         'Accept': '*/*',
//                         'Accept-Language': 'en',
//                         'Connection': 'keep-alive',
//                         'Accept-Encoding': 'gzip, deflate, br',
//                         'Cookie': `ACCESS_TOKEN=${loginResult.token};`,
//                         'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
//                         'X-App-Name': 'web',
//                         'X-App-Version': '1.4.1',
//                         'X-Device-Info': 'iPhone 11',
//                         'X-Device-Id': 'TEST3'
//                     };

//                     const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
//                     // const pinRes = http.post('https://internal-api-pt.growin.id/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
//                     // console.log(`DEBUG - token: '${loginResult.token}' | pin: '${pinRes.json().data.pin_token}'`);
//                     if (pinRes.status === 200) {
//                         totalPinSuccess++;
//                         tokens[userKey].pin_token = pinRes.json().data.pin_token;
//                     } else {
//                         totalPinFailed++;
//                         if (i === batchStart || totalPinFailed <= 5) {
//                             console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) PIN FAILED - Status: ${pinRes.status}`);
//                         }
//                         tokens[userKey].pin_token = null;
//                     }
//                 } else {
//                     totalLoginFailed++;
//                     totalLoginRetries += (loginResult.attempts - 1);
//                     tokens[userKey] = { 
//                         email: credentials.email, 
//                         token: null,
//                         pin_token: null,
//                         bp: bp
//                     };
//                 }
//             }
            
//             console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
//             if (batchNum < numBatches - 1) {
//                 sleep(BATCH_DELAY);
//             }
//         }
        
//         globalUserOffset += usersForThisBP;
//         globalVuOffset += usersForThisBP;
//     });
    
    
//     // ✅ Summary
//     console.log(`\n📊 Setup Summary:`);
//     console.log(`   ✅ Login: ${totalLoginSuccess}/${TOTAL_USER} success (${((totalLoginSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
//     if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
//     if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries} total retry attempts`);
    
//     console.log(`   ✅ PIN: ${totalPinSuccess}/${TOTAL_USER} success (${((totalPinSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
//     if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    
//     console.log(`\n📋 Per-BP Summary:`);
//     selectedBPs.forEach(bp => {
//         const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
//         const logins = bpTokens.filter(t => t.token !== null).length;
//         const pins = bpTokens.filter(t => t.pin_token !== null).length;
//         const channelId = channelIds[bp] || 'N/A';
        
//         console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs, channel_id: ${channelId}`);
//     });
    
//     console.log(`\n🎉 Setup completed!`);
    
//     return { 
//         base_url: base_url, 
//         tokens: tokens,
//         vuMapping: vuMapping,
//         channelIds: channelIds  // ✅ Pass channelIds object ke semua BP functions
//     };
// }

// ✅ LOGIN WITH RETRY — uses MAX_RETRY_ATTEMPTS & RETRY_DELAY from Helper/config.js
function loginWithRetry(base_url, credentials, userKey, vuId) {
    const loginPayload = JSON.stringify({
        password: credentials.password,
        email: credentials.email,
        recaptcha: '',
    });
 
    const loginHeaders = getDefaultHeaders(); // ✅ from Helper/config.js
 
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
    const base_url = getBaseUrl(); // ✅ from Helper/config.js
    const tokens = {};
    const vuMapping = {};
    const channelIds = {};
    
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
                const credentials = getUserCredentials(i, globalUserOffset); // ✅ from Helper/config.js
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
 
                    const profileHeaders = getDefaultHeaders(loginResult.token); // ✅ from Helper/config.js
 
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
                    const pinHeaders = getDefaultHeaders(loginResult.token); // ✅ from Helper/config.js
 
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
        const channelId = channelIds[bp] || 'N/A';
        
        console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs, channel_id: ${channelId}`);
    });
    
    console.log(`\n🎉 Setup completed!`);
    
    return { 
        base_url: base_url, 
        tokens: tokens,
        vuMapping: vuMapping,
        channelIds: channelIds
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
            bp_name = selectedBPs[0]; // langsung 'BP001', bukan 'BP001_A'
        } else if (selectedBPs.length > 1) {
            // Sort dan ambil range
            const sortedBPs = [...selectedBPs].sort();
            
            // Extract numbers dari BP name (BP001 -> 1, BP002 -> 2)
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
            const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'Regression') {
            const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'LoadTest') {
            const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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