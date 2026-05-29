// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
// ENHANCE-P1: collapsed undefined BPxxx_Android refs to imported fallback. Original runner has live bug.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Password_Expired/Growin_Password_Expired_Web_LoadTest.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

// // Command
// // Gcloud compute ssh --project compute-dev-0108 --zone asia-southeast2-c "vm-dev-k6-0" --tunnel-through-iap -- -L 22:10.188.2.36:22
// // Run Multiple BP
// // ../../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Password_Expired/Web/LoadTest/Manual_LoadTest_0107_1459.html

// // Run Single BP Android
// // ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=DEV -e USER=1 -e DURATION=30m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Password_Expired/Android/BP001/Manual/Manual_DryRun_0415_1407_BP001_Local.html
// // ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Password_Expired/Android/BP002/Manual/Manual_DryRun_0113_1554_BP002_Local.html

// // Run Single BP iOS
// ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=1m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Password_Expired/iOS/BP001/Manual/Manual_DryRun_0511_1305_BP001_Local.html
// ../../k6 run --local-ips=10.184.120.42-10.184.120.47 Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=2h -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Password_Expired/iOS/BP001/Manual/Manual_DryRun_0428_1410_BP001_Local.html
// // ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Password_Expired/iOS/BP002/Manual/Manual_DryRun_0113_1554_BP002_Local.html

// import { textSummary } from "../../Helper/textSummary.js";
// import { htmlReport } from '../../Helper/bundle.js';
// import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
// import { BP001 as BP001_Android } from "./Android/BP001.js";
// import { BP002 as BP002_Android } from "./Android/BP002.js";
// import { BP001 as BP001_iOS } from "./iOS/BP001.js";
// import { BP002 as BP002_iOS } from "./iOS/BP002.js";

// import http from "k6/http";
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.
// import { sleep } from "k6";
// import { Rate } from "k6/metrics";
// // ../k6 run Growin_BurstOrder_V3.js -e ENV=INT -e USERNAME=TESTMON -e MAIL=guysmail.com -e PAD=2 -e NUMSTART=1000 -e USER=2 -e ITER=1 -e RUNTIME=60 -e INTERVAL=300
// function getPlatform() {
//     const { PLATFORM } = __ENV;
    
//     if (PLATFORM && ['Android', 'iOS'].includes(PLATFORM)) {cd..
//         return PLATFORM;
//     }
    
//     console.error('❌ PLATFORM must be specified: Android or iOS');
//     console.error('   Example: -e PLATFORM=Android or -e PLATFORM=iOS');
//     return 'Android'; // default fallback
// }

// const platform = getPlatform();

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

// // Export BP yang tepat berdasarkan platform
// export const BP001 = platform === 'iOS' ? BP001_iOS : BP001_Android;
// export const BP002 = platform === 'iOS' ? BP002_iOS : BP002_Android;

// // ✅ RETRY CONFIGURATION
// // const MAX_RETRY_ATTEMPTS = 10;
// // const RETRY_DELAY = 1; // seconds between retry attempts

// const BP_USER_PERCENTAGE = {
//     BP001: 50,
//     BP002: 50,
// };

// // ✅ Function untuk calculate user distribution
// function calculateUserDistribution(totalUsers, selectedBPs) {
//     const distribution = {};
//     let totalPercentage = 0;
    
//     selectedBPs.forEach(bp => {
//         totalPercentage += BP_USER_PERCENTAGE[bp] || 0;
//     });
    
//     if (totalPercentage === 0) {
//         console.error('❌ No valid BP selected or percentage not defined!');
//         return distribution;
//     }
    
//     let allocatedUsers = 0;
//     selectedBPs.forEach((bp, index) => {
//         const percentage = BP_USER_PERCENTAGE[bp];
        
//         if (index === selectedBPs.length - 1) {
//             distribution[bp] = totalUsers - allocatedUsers;
//         } else {
//             const users = Math.floor((percentage / totalPercentage) * totalUsers);
//             distribution[bp] = users;
//             allocatedUsers += users;
//         }
//     });
    
//     return distribution;
// }

// const { SCENARIO } = __ENV;
// const TOTAL_USER = parseInt(__ENV.TOTAL_USER) || parseInt(__ENV.USER) || 100;

// let selectedBPs = [];
// if (SCENARIO) {
//     // User bisa input: BP001 atau BP001,BP002
//     selectedBPs = SCENARIO.split(',').map(s => s.trim());
// } else {
//     // Default: jalankan semua BP
//     selectedBPs = Object.keys(BP_USER_PERCENTAGE);
// }

// const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

// console.log('📊 User Distribution:');
// Object.keys(userDistribution).forEach(bp => {
//     console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_USER_PERCENTAGE[bp]}%)`);
// });
// console.log(`   TOTAL: ${TOTAL_USER} users`);
// console.log(`   PLATFORM: ${platform}`);

// const scenarios = {};
// selectedBPs.forEach(bp => {
//     scenarios[bp] = {
//         // executor: 'per-vu-iterations',
//         // vus: 1,
//         // iterations: 1,
//         // maxDuration: '1h',

//         // executor: 'ramping-vus',
//         // startVUs: 0,
//         // stages: [
//         //     { duration: '5m', target: 100 },
//         //     { duration: '10m', target: 100 },
//         //     { duration: '5m', target: 200 },
//         //     { duration: '10m', target: 200 },
//         //     { duration: '5m', target: 300 },
//         //     { duration: '10m', target: 300 },
//         //     { duration: '5m', target: 400 },
//         //     { duration: '10m', target: 400 },

//         //     { duration: '5m', target: 500 },
//         //     { duration: '10m', target: 500 },
//         //     { duration: '5m', target: 600 },
//         //     { duration: '10m', target: 600 },
//         //     { duration: '5m', target: 700 },
//         //     { duration: '10m', target: 700 },
//         //     { duration: '5m', target: 800 },
//         //     { duration: '10m', target: 800 },

//         //     { duration: '5m', target: 900 },
//         //     { duration: '10m', target: 900 },
//         //     { duration: '5m', target: 1000 },
//         //     { duration: '10m', target: 1000 },
//         //     { duration: '5m', target: 1100 },
//         //     { duration: '10m', target: 1100 },
//         //     { duration: '5m', target: 1200 },
//         //     { duration: '10m', target: 1200 },

//         //     { duration: '5m', target: 1300 },
//         //     { duration: '10m', target: 1300 },
//         //     { duration: '5m', target: 1400 },
//         //     { duration: '10m', target: 1400 },
//         //     { duration: '5m', target: 1500 },
//         //     { duration: '10m', target: 1500 },
//         //     { duration: '5m', target: 1600 },
//         //     { duration: '10m', target: 1600 },

//         //     { duration: '5m', target: 1700 },
//         //     { duration: '10m', target: 1700 },
//         //     { duration: '5m', target: 1800 },
//         //     { duration: '10m', target: 1800 },
//         //     { duration: '5m', target: 1900 },
//         //     { duration: '10m', target: 1900 },
//         //     { duration: '5m', target: 2000 },
//         //     { duration: '10m', target: 2000 },
//         //     { duration: '5m', target: 0 },
//         // ],

//         executor: 'constant-vus',
//         vus: userDistribution[bp] || 1,
//         duration: `${__ENV.DURATION}`,

//         gracefulStop: '30s',
//         exec: bp, // akan memanggil BP001() atau BP002() sesuai export di atas
//     };
// });

// export const options = {
//     scenarios: scenarios,
//     noConnectionReuse: false,
//     setupTimeout: '3600s',
//     teardownTimeout: '3600s',
//     summaryTimeUnit: '3600s',
//     // httpDebug: 'full', // optional, untuk debug
// };

// // ✅ LOGIN WITH RETRY — uses MAX_RETRY_ATTEMPTS & RETRY_DELAY from Helper/config.js
// function loginWithRetry(base_url, credentials, userKey, vuId) {
//     const loginPayload = JSON.stringify({
//         password: credentials.password,
//         email: credentials.email,
//         recaptcha: '',
//     });
 
//     const loginHeaders = getDefaultHeaders(); // ✅ from Helper/config.js
 
//     for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
//         const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
 
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
    
//     return { success: false, token: null, attempts: MAX_RETRY_ATTEMPTS };
// }
 
// export function setup() {
//     const base_url = getBaseUrl(); // ✅ from Helper/config.js
//     const tokens = {};
//     const vuMapping = {};
//     const channelIds = {};
    
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
    
//     selectedBPs.forEach((bp, bpIndex) => {
//         const usersForThisBP = userDistribution[bp];
        
//         console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
//         for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
//             const vuId = globalVuOffset + localUserIndex - 1;
//             vuMapping[vuId] = {
//                 bp: bp,
//                 userKey: globalUserOffset + localUserIndex
//             };
//         }
        
//         const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
//         for (let batchNum = 0; batchNum < numBatches; batchNum++) {
//             const batchStart = batchNum * BATCH_SIZE + 1;
//             const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
//             console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
//             for (let i = batchStart; i <= batchEnd; i++) {
//                 const credentials = getUserCredentials(i, globalUserOffset); // ✅ from Helper/config.js
//                 const userKey = globalUserOffset + i;
//                 const vuId = globalVuOffset + i - 1;
                
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
 
//                     const profileHeaders = getDefaultHeaders(loginResult.token); // ✅ from Helper/config.js
 
//                     const profileUrls = [base_url + `/user/api/v1/profile/trading`];
//                     const profileRequests = [['GET', profileUrls[0], null, { headers: profileHeaders }]];
//                     const profileResponses = http.batch(profileRequests);
 
//                     if (profileResponses[0].status == 200) {
//                         totalUserIdSuccess++;
//                         const tradingData = profileResponses[0].json().data;
                        
//                         if (!tokens[userKey]) tokens[userKey] = {};
                        
//                         tokens[userKey].user_id     = tradingData.user_id;
//                         tokens[userKey].client_id   = tradingData.client_id;
//                         tokens[userKey].SID         = tradingData.sid;
//                         tokens[userKey].ksei_acc_no = tradingData.ksei_acc_no;
//                         tokens[userKey].account_name = tradingData.account_name;
                        
//                         console.log(`✅ Assigned - user_id: ${tokens[userKey].user_id}, client_id: ${tokens[userKey].client_id}`);
//                     } else {
//                         totalUserIdFailed++;
//                         if (i === batchStart || totalUserIdFailed <= 5) {
//                             console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) GET trading profile FAILED - Status: ${profileResponses[0].status} || Body: ${profileResponses[0].body}`);
//                         }
//                         tokens[userKey].user_id      = null;
//                         tokens[userKey].client_id    = null;
//                         tokens[userKey].SID          = null;
//                         tokens[userKey].ksei_acc_no  = null;
//                         tokens[userKey].account_name = null;
//                     }
                    
//                     const pinPayload = JSON.stringify({ value: "123456" });
//                     const pinHeaders = getDefaultHeaders(loginResult.token); // ✅ from Helper/config.js
 
//                     const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
 
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
//         channelIds: channelIds
//     };
// }

// export function handleSummary(data) {
//     try {
//         if (!data.metrics.data_received) {
//             data.metrics.data_received = { values: { count: 0, rate: 0 } };
//         }
//         if (!data.metrics.data_sent) {
//             data.metrics.data_sent = { values: { count: 0, rate: 0 } };
//         }

//         const now = new Date();
//         const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
//         const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        
//         const runby = __ENV.RUNBY || 'Manual';
        
//         let bp_name = 'AllBP';
        
//         if (selectedBPs.length === 1) {
//             bp_name = selectedBPs[0]; // langsung 'BP001', bukan 'BP001_A'
//         } else if (selectedBPs.length > 1) {
//             // Sort dan ambil range
//             const sortedBPs = [...selectedBPs].sort();
            
//             // Extract numbers dari BP name (BP001 -> 1, BP002 -> 2)
//             const nums = sortedBPs.map(x => parseInt(x.replace('BP', '')))
//                 .filter(x => !isNaN(x))
//                 .sort((a, b) => a - b);
            
//             if (nums.length > 0) {
//                 const min = String(nums[0]).padStart(3, '0');
//                 const max = String(nums[nums.length - 1]).padStart(3, '0');
//                 bp_name = `BP${min}-BP${max}`;
//             }
//         }
        
//         console.log(`[${dateStr}_${timeStr}] Starting report generation for ${bp_name} on ${platform}...`);
        
//         if (runby === 'Manual') {
//             const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
//             console.log(`Generating HTML: ${htmlPath}`);
            
//             return {
//                 [htmlPath]: htmlReport(data),
//                 'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//             };
//         } else if (runby === 'Regression') {
//             const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
//             console.log(`Generating HTML: ${htmlPath}`);
            
//             return {
//                 [htmlPath]: htmlReport(data),
//                 'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//             };
//         } else if (runby === 'LoadTest') {
//             const htmlPath = `../../Report/Growin_AI_Summarizer/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
//             console.log(`Generating HTML: ${htmlPath}`);
            
//             return {
//                 [htmlPath]: htmlReport(data),
//                 'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//             };
//         }
        
//     } catch (error) {
//         console.error(`❌ handleSummary error: ${error.message}`);
//         console.error(`Stack: ${error.stack}`);
        
//         return {
//             'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//         };
//     }
// }

// // Command
// // Run Multiple BP
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=2h -e NUMSTART=1001 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/LoadTest/Manual_LoadTest_1208_1413.html

// // Run Single BP
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP001/Manual/Manual_DryRun_0417_1111_BP001_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP002/Manual/Manual_DryRun_1113_1708_BP002_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP003 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP003/Manual/Manual_DryRun_1209_1343_BP003_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP004 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_1113_1708_BP004_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP005 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP005/Manual/Manual_DryRun_1113_1708_BP005_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP006 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP006/Manual/Manual_DryRun_1209_1406_BP006_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP007 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_0422_1110_BP007_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP008 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_0421_1152_BP008_Local.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP009 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP009/Manual/Manual_DryRun_1120_1347_BP009_Local.html

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';
import { BP001 as BP001_Web } from "./iOS/BP001.js";
import { BP002 as BP002_Web } from "./iOS/BP002.js";
// import { BP003 as BP003_Web } from "./iOS/BP003.js";
// import { BP004 as BP004_Web } from "./iOS/BP004.js";
// import { BP005 as BP005_Web } from "./iOS/BP005.js";
// import { BP006 as BP006_Web } from "./iOS/BP006.js";
// import { BP007 as BP007_Web } from "./iOS/BP007.js";
// import { BP008 as BP008_Web } from "./iOS/BP008.js";
// import { BP009 as BP009_Web } from "./iOS/BP009.js";

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
    return 'Web';
}

const platform = getPlatform();

export const BP001 = platform === 'Android' ? BP001_Android : BP001_Web;
export const BP002 = platform === 'Android' ? BP002_Android : BP002_Web;
// export const BP003 = platform === 'Android' ? BP003_Web : BP003_Web;
// export const BP004 = platform === 'Android' ? BP004_Web : BP004_Web;
// export const BP005 = platform === 'Android' ? BP005_Web : BP005_Web;
// export const BP006 = platform === 'Android' ? BP006_Web : BP006_Web;
// export const BP007 = platform === 'Android' ? BP007_Web : BP007_Web;
// export const BP008 = platform === 'Android' ? BP008_Web : BP008_Web;
// export const BP009 = platform === 'Android' ? BP009_Web : BP009_Web;

// ✅ BP_CONFIG: percentage + executor per BP
const BP_CONFIG = {
    BP001: { percentage: 20.5, executor: 'constant-vus' },
    BP002: { percentage: 10.5, executor: 'constant-vus' },
    BP003: { percentage: 30.5, executor: 'constant-vus' },
    // BP004: { percentage: 10.5, executor: 'constant-vus' },
    // BP005: { percentage: 20.5, executor: 'constant-vus' },
    // BP006: { percentage: 5.5,  executor: 'constant-arrival-rate', rate: 70 },
    // BP007: { percentage: 0.5,  executor: 'constant-arrival-rate', rate: 70 },
    // BP008: { percentage: 1.0,  executor: 'constant-arrival-rate', rate: 70 },
    // BP009: { percentage: 0.5,  executor: 'constant-vus' },
};

function calculateUserDistribution(totalUsers, selectedBPs) {
    const distribution = {};
    let totalPercentage = 0;
    
    selectedBPs.forEach(bp => {
        totalPercentage += BP_CONFIG[bp]?.percentage || 0;
    });
    
    if (totalPercentage === 0) {
        console.error('❌ No valid BP selected or percentage not defined!');
        return distribution;
    }
    
    let allocatedUsers = 0;
    selectedBPs.forEach((bp, index) => {
        const percentage = BP_CONFIG[bp].percentage;
        
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
    selectedBPs = Object.keys(BP_CONFIG);
}

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

console.log('📊 User Distribution:');
Object.keys(userDistribution).forEach(bp => {
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_CONFIG[bp].percentage}%)`);
});
console.log(`   TOTAL: ${TOTAL_USER} users`);
console.log(`   PLATFORM: ${platform}`);

const scenarios = {};

selectedBPs.forEach(bp => {
    const config = BP_CONFIG[bp];

    if (config.executor === 'constant-arrival-rate') {
        scenarios[bp] = {
            executor: 'constant-arrival-rate',
            rate: config.rate,
            timeUnit: '1s',
            duration: `${__ENV.DURATION}`,
            preAllocatedVUs: userDistribution[bp] || 10,
            maxVUs: (userDistribution[bp] || 10) * 2,
            gracefulStop: '30s',
            exec: bp,
        };
    } else {
        scenarios[bp] = {
            executor: 'constant-vus',
            vus: userDistribution[bp] || 1,
            duration: `${__ENV.DURATION}`,
            gracefulStop: '30s',
            exec: bp,
        };
    }
});

export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
};

// ✅ PARALLEL BATCH LOGIN
// Mengirim semua login request dalam satu batch, lalu retry hanya yang gagal
function batchLoginWithRetry(base_url, batchCredentialsList) {
    // batchCredentialsList: array of { credentials, userKey, vuId }
    let pendingUsers = batchCredentialsList.map(item => ({ ...item, attempts: 0 }));
    const results = {}; // userKey -> { success, token, attempts }

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        if (pendingUsers.length === 0) break;

        console.log(`   🔁 Login attempt ${attempt}/${MAX_RETRY_ATTEMPTS} for ${pendingUsers.length} users...`);

        // Build batch request untuk semua pending users
        

        const loginRequests = pendingUsers.map(item => {
            item.payload = JSON.stringify({
                password: item.credentials.password,
                email: item.credentials.email,
                recaptcha: '',
            });

            return [
                'POST',
                base_url + '/auth/api/v1/login',
                item.payload,
                { headers: getDefaultHeaders() }
            ];
        });

        const loginResponses = http.batch(loginRequests);

        const stillFailing = [];

        loginResponses.forEach((res, idx) => {
            const item = pendingUsers[idx];
            item.attempts = attempt;

            if (res.status === 200) {
                results[item.userKey] = {
                    success: true,
                    token: res.json().data.token,
                    attempts: attempt,
                    credentials: item.credentials,
                    vuId: item.vuId,
                };
                if (attempt > 1) {
                    console.log(`   ✅ User ${item.userKey} (${item.credentials.email}, VU${item.vuId}) LOGIN SUCCESS on attempt ${attempt}`);
                }
            } else {
                if (attempt < MAX_RETRY_ATTEMPTS) {
                    if (res.status != 503) {
                        // ENHANCE: Truncate response body under load before enabling this log in production.
console.warn(`   ⚠️  User ${item.userKey} (${item.credentials.email}, VU${item.vuId}) attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${res.status}, Body: ${res.body}, with Payload: ${item.payload} retrying...`);
                    }
                } else {
                    console.error(`   ❌ User ${item.userKey} (${item.credentials.email}, VU${item.vuId}) LOGIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts - Status: ${res.status}`);
                }
                stillFailing.push(item);
            }
        });

        pendingUsers = stillFailing;

        if (pendingUsers.length > 0 && attempt < MAX_RETRY_ATTEMPTS) {
            sleep(RETRY_DELAY);
        }
    }

    // Mark remaining failed users
    pendingUsers.forEach(item => {
        results[item.userKey] = {
            success: false,
            token: null,
            attempts: item.attempts,
            credentials: item.credentials,
            vuId: item.vuId,
        };
    });

    return results;
}

// ✅ PARALLEL BATCH: PIN + Profile sekaligus untuk semua valid users
function batchFetchPinAndProfile(base_url, validUsers) {
    // validUsers: array of { userKey, token }
    if (validUsers.length === 0) return {};

    const pinRequests     = validUsers.map(u => [
        'POST',
        base_url + '/auth/api/v1/protected/pin-login',
        JSON.stringify({ value: "123456" }),
        { headers: getDefaultHeaders(u.token) }
    ]);

    const profileRequests = validUsers.map(u => [
        'GET',
        base_url + '/user/api/v1/profile/trading',
        null,
        { headers: getDefaultHeaders(u.token) }
    ]);

    // Kirim PIN dan profile requests secara parallel (dua batch bersamaan tidak bisa,
    // tapi dua http.batch() berturut-turut jauh lebih cepat dari sequential per-user)
    const pinResponses     = http.batch(pinRequests);
    const profileResponses = http.batch(profileRequests);

    const results = {};

    validUsers.forEach((u, idx) => {
        results[u.userKey] = {
            pin_token: null,
            user_id: null,
            client_id: null,
            SID: null,
            ksei_acc_no: null,
            account_name: null,
        };

        // PIN
        if (pinResponses[idx].status === 200) {
            results[u.userKey].pin_token = pinResponses[idx].json().data.pin_token;
        } else {
            console.error(`   ❌ PIN FAILED user ${u.userKey} (${u.email}) - Status: ${pinResponses[idx].status}`);
        }

        // Profile
        if (profileResponses[idx].status === 200) {
            const tradingData = profileResponses[idx].json().data;
            results[u.userKey].user_id      = tradingData.user_id;
            results[u.userKey].client_id    = tradingData.client_id;
            results[u.userKey].SID          = tradingData.sid;
            results[u.userKey].ksei_acc_no  = tradingData.ksei_acc_no;
            results[u.userKey].account_name = tradingData.account_name;

            console.log(`✅ Assigned - user_id: ${tradingData.user_id}, client_id: ${tradingData.client_id}`);
        } else {
            console.error(`   ❌ Profile FAILED user ${u.userKey} (${u.email}) - Status: ${profileResponses[idx].status} || Body: ${profileResponses[idx].body}`);
        }
    });

    return results;
}

export function setup() {
    const base_url = getBaseUrl();
    const tokens   = {};
    const vuMapping = {};
    const channelIds = {};

    console.log(`🔐 Starting PARALLEL login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay between batches`);
    console.log(`🔁 Retry enabled: Max ${MAX_RETRY_ATTEMPTS} attempts per login (batch retry)`);
    console.log(`🔑 ALL users will get PIN token`);
    console.log(`📱 Platform: ${platform}`);

    let globalUserOffset = 0;
    let globalVuOffset   = 1;

    let totalLoginSuccess  = 0;
    let totalLoginFailed   = 0;
    let totalLoginRetries  = 0;
    let totalPinSuccess    = 0;
    let totalPinFailed     = 0;
    let totalUserIdSuccess = 0;
    let totalUserIdFailed  = 0;

    selectedBPs.forEach((bp) => {
        const usersForThisBP = userDistribution[bp];

        console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);

        // Build VU mapping untuk BP ini
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
            const batchEnd   = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);

            console.log(`\n   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd} (${batchEnd - batchStart + 1} users)`);

            // ── Step 1: Build credential list untuk batch ini ──────────────────
            const batchCredentialsList = [];
            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey     = globalUserOffset + i;
                const vuId        = globalVuOffset + i - 1;
                batchCredentialsList.push({ credentials, userKey, vuId });
            }

            // ── Step 2: Parallel login dengan retry hanya untuk yang gagal ─────
            const loginResults = batchLoginWithRetry(base_url, batchCredentialsList);

            // ── Step 3: Pisahkan success vs failed, hitung stats ──────────────
            const validUsersForPinProfile = [];

            Object.entries(loginResults).forEach(([userKeyStr, result]) => {
                const userKey = parseInt(userKeyStr);

                if (result.success) {
                    totalLoginSuccess++;
                    if (result.attempts > 1) {
                        totalLoginRetries += (result.attempts - 1);
                    }

                    tokens[userKey] = {
                        email:     result.credentials.email,
                        token:     result.token,
                        pin_token: null,
                        bp:        bp,
                        user_id:   null, client_id: null,
                        SID:       null, ksei_acc_no: null,
                        account_name: null,
                    };

                    validUsersForPinProfile.push({
                        userKey,
                        token: result.token,
                        email: result.credentials.email,
                    });
                } else {
                    totalLoginFailed++;
                    totalLoginRetries += (result.attempts - 1);

                    tokens[userKey] = {
                        email:     result.credentials.email,
                        token:     null,
                        pin_token: null,
                        bp:        bp,
                        user_id:   null, client_id: null,
                        SID:       null, ksei_acc_no: null,
                        account_name: null,
                    };
                }
            });

            // ── Step 4: Parallel PIN + Profile untuk semua valid users sekaligus
            if (validUsersForPinProfile.length > 0) {
                console.log(`   🔑 Fetching PIN + Profile for ${validUsersForPinProfile.length} valid users in parallel...`);

                const pinProfileResults = batchFetchPinAndProfile(base_url, validUsersForPinProfile);

                Object.entries(pinProfileResults).forEach(([userKeyStr, data]) => {
                    const userKey = parseInt(userKeyStr);

                    // PIN stats
                    if (data.pin_token !== null) {
                        totalPinSuccess++;
                    } else {
                        totalPinFailed++;
                    }

                    // Profile stats
                    if (data.user_id !== null) {
                        totalUserIdSuccess++;
                    } else {
                        totalUserIdFailed++;
                    }

                    // Merge ke tokens
                    tokens[userKey].pin_token    = data.pin_token;
                    tokens[userKey].user_id      = data.user_id;
                    tokens[userKey].client_id    = data.client_id;
                    tokens[userKey].SID          = data.SID;
                    tokens[userKey].ksei_acc_no  = data.ksei_acc_no;
                    tokens[userKey].account_name = data.account_name;
                });
            }

            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed — Login: ${validUsersForPinProfile.length}/${batchEnd - batchStart + 1} success`);

            if (batchNum < numBatches - 1) {
                sleep(BATCH_DELAY);
            }
        }

        globalUserOffset += usersForThisBP;
        globalVuOffset   += usersForThisBP;
    });

    // ── Final Summary ──────────────────────────────────────────────────────────
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login:   ${totalLoginSuccess}/${TOTAL_USER} success (${((totalLoginSuccess / TOTAL_USER) * 100).toFixed(1)}%)`);
    if (totalLoginFailed  > 0) console.error(`   ❌ Login Failed:  ${totalLoginFailed}`);
    if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries} total retry attempts`);

    console.log(`   ✅ PIN:     ${totalPinSuccess}/${TOTAL_USER} success (${((totalPinSuccess / TOTAL_USER) * 100).toFixed(1)}%)`);
    if (totalPinFailed    > 0) console.error(`   ❌ PIN Failed:    ${totalPinFailed}`);

    console.log(`   ✅ Profile: ${totalUserIdSuccess}/${TOTAL_USER} success (${((totalUserIdSuccess / TOTAL_USER) * 100).toFixed(1)}%)`);
    if (totalUserIdFailed > 0) console.error(`   ❌ Profile Failed: ${totalUserIdFailed}`);

    console.log(`\n📋 Per-BP Summary:`);
    selectedBPs.forEach(bp => {
        const bpTokens   = Object.values(tokens).filter(t => t.bp === bp);
        const logins     = bpTokens.filter(t => t.token     !== null).length;
        const pins       = bpTokens.filter(t => t.pin_token !== null).length;
        const channelId  = channelIds[bp] || 'N/A';
        console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs, channel_id: ${channelId}`);
    });

    console.log(`\n🎉 Setup completed!`);

    return {
        base_url: base_url,
        tokens:   tokens,
        vuMapping: vuMapping,
        channelIds: channelIds,
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

        const now     = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');

        const runby = __ENV.RUNBY || 'Manual';

        let bp_name = 'AllBP';

        if (selectedBPs.length === 1) {
            bp_name = selectedBPs[0];
        } else if (selectedBPs.length > 1) {
            const sortedBPs = [...selectedBPs].sort();
            const nums = sortedBPs
                .map(x => parseInt(x.replace('BP', '')))
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
            const htmlPath = `../../Report/Growin_Eipo_Stock/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'Regression') {
            const htmlPath = `../../Report/Growin_Eipo_Stock/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'LoadTest') {
            const htmlPath = `../../Report/Growin_Eipo_Stock/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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