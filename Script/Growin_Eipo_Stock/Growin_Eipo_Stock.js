// // Command
// // Run Multiple BP
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=2h -e NUMSTART=1001 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/LoadTest/Manual_LoadTest_1208_1413.html

// // Run Single BP
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=63 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP001 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP001/Manual/Manual_DryRun_0417_1111_BP001_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=31 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP002 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP002/Manual/Manual_DryRun_1113_1708_BP002_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=94 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP003 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP003/Manual/Manual_DryRun_1209_1343_BP003_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=31 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP004 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_1113_1708_BP004_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=63 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP005 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP005/Manual/Manual_DryRun_1113_1708_BP005_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=15 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP006 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP006/Manual/Manual_DryRun_1209_1406_BP006_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=205 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP007 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_1208_1048_BP007_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP008 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_1119_1127_BP008_Local.html
// // ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP009 --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP009/Manual/Manual_DryRun_1120_1347_BP009_Local.html

// import { textSummary } from "../../Helper/textSummary.js";
// import { htmlReport } from '../../Helper/bundle.js';
// import { BP001 } from "./iOS/BP001.js";
// import { BP002 } from "./iOS/BP002.js";
// import { BP003 } from "./iOS/BP003.js";
// import { BP004 } from "./iOS/BP004.js";
// import { BP005 } from "./iOS/BP006.js";
// import { BP006 } from "./iOS/BP005.js";
// import { BP007 } from "./iOS/BP007.js";
// import { BP008 } from "./iOS/BP009.js";
// import { BP009 } from "./iOS/BP008.js";
// import http from "k6/http";
// import { sleep } from "k6";

// export { BP001, BP002, BP003, BP004, BP005, BP006, BP007, BP008, BP009 }

// // ✅ DEFINISI PERSENTASE USER PER BP
// // const BP_USER_PERCENTAGE = {
// //     BP001: 20.5,
// //     BP002: 10.5,
// //     BP003: 30.5,
// //     BP004: 10.5,
// //     BP005: 20.5,
// //     BP006: 5.5,
// //     BP007: 0.5,
// //     BP008: 1.0,
// //     BP009: 0.5,
// // };

// const BP_CONFIG = {
//     BP001: { percentage: 20.5, executor: 'constant-vus' },
//     BP002: { percentage: 10.5, executor: 'constant-vus' },
//     BP003: { percentage: 30.5, executor: 'constant-vus' },
//     BP004: { percentage: 10.5, executor: 'constant-vus' },
//     BP005: { percentage: 20.5, executor: 'constant-vus' },
//     BP006: { percentage: 5.5, executor: 'constant-arrival-rate', rate: 5 },
//     BP007: { percentage: 0.5, executor: 'constant-arrival-rate', rate: 5 },
//     BP008: { percentage: 1.0, executor: 'constant-arrival-rate', rate: 5 },
//     BP009: { percentage: 0.5, executor: 'constant-vus' },
// };

// // ✅ Function untuk calculate user distribution
// function calculateUserDistribution(totalUsers, selectedBPs) {
//     const distribution = {};
//     let totalPercentage = 0;
    
//     selectedBPs.forEach(bp => {
//         totalPercentage += BP_CONFIG[bp]?.percentage || 0;  // ✅ Access .percentage property
//     });
    
//     if (totalPercentage === 0) {
//         console.error('❌ No valid BP selected or percentage not defined!');
//         return distribution;
//     }
    
//     let allocatedUsers = 0;
//     selectedBPs.forEach((bp, index) => {
//         const percentage = BP_CONFIG[bp].percentage;  // ✅ Get the percentage value
        
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
//     selectedBPs = SCENARIO.split(',').map(s => s.trim());
// } else {
//     selectedBPs = Object.keys(BP_CONFIG);
// }

// const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

// console.log('📊 User Distribution:');
// Object.keys(userDistribution).forEach(bp => {
//     console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_CONFIG[bp].percentage}%)`);  // ✅ Fixed
// });
// console.log(`   TOTAL: ${TOTAL_USER} users`);

// const scenarios = {};
// selectedBPs.forEach(bp => {
//     const config = BP_CONFIG[bp];
//     const userCount = userDistribution[bp] || 1;
    
//     if (config.executor === 'constant-arrival-rate') {
//         // ✅ CRITICAL FIX: Ensure maxVUs is ALWAYS greater than preAllocatedVUs
//         const preAllocated = Math.max(2, Math.ceil(userCount * 0.3));  // Minimum 2 VUs
//         const maxVUs = Math.max(preAllocated + 5, userCount);  // At least 5 more than preAllocated
        
//         scenarios[bp] = {
//             executor: 'constant-arrival-rate',
//             rate: config.rate,
//             timeUnit: '1s',
//             duration: `${__ENV.DURATION}`,
//             preAllocatedVUs: preAllocated,
//             maxVUs: maxVUs,
//             exec: bp,
//         };
        
//         console.log(`   🔧 ${bp}: preAllocated=${preAllocated}, maxVUs=${maxVUs}, rate=${config.rate}/s`);
//     } else {
//         scenarios[bp] = {
//             executor: 'constant-vus',
//             vus: userCount,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '30s',
//             exec: bp,
//         };
//     }
// });

// export const options = {
//     scenarios: scenarios,
//     noConnectionReuse: false,
//     setupTimeout: '3600s', // ✅ Increased for large user counts
//     teardownTimeout: '3600s',
//     summaryTimeUnit: '3600s',
// }

// function getBaseUrl() {
//     if(`${__ENV.ENV}`=='DEV'){
//         return 'https://dev-api.growin.id';
//     } else if ((`${__ENV.ENV}`=='QA')) {
//         return 'https://api-qa.growin.id';
//     } else if (`${__ENV.ENV}`=='DRC') {
//         return 'https://drc-api.growin.id';
//     } else if (`${__ENV.ENV}`=='INT') {
//         return 'https://internal-api-pt.growin.id';
//     }
//     return 'https://internal-api-pt.growin.id';
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

// // ✅ SETUP FUNCTION - SEMUA BP mendapat PIN dan UUID
// export function setup() {
//     const base_url = getBaseUrl();
//     const tokens = {};
//     const vuMapping = {};
    
//     const BATCH_SIZE = 500; // Process 50 users at a time
//     const BATCH_DELAY = 0; // 3 seconds between batches
    
//     console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
//     console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
//     console.log(`🔑 ALL users will get PIN token`);
    
//     let globalUserOffset = 0;
//     let globalVuOffset = 1;
    
//     let totalLoginSuccess = 0;
//     let totalLoginFailed = 0;
//     let totalPinSuccess = 0;
//     let totalPinFailed = 0;
    
//     selectedBPs.forEach((bp, bpIndex) => {
//         const usersForThisBP = userDistribution[bp];
        
//         console.log(`\n📦 Processing ${bp} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
//         // Create VU mapping
//         for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
//             const vuId = globalVuOffset + localUserIndex - 1;
//             vuMapping[vuId] = {
//                 bp: bp,
//                 userKey: globalUserOffset + localUserIndex
//             };
//         }
        
//         // ✅ Process in batches
//         const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
//         for (let batchNum = 0; batchNum < numBatches; batchNum++) {
//             const batchStart = batchNum * BATCH_SIZE + 1;
//             const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
//             console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
//             for (let i = batchStart; i <= batchEnd; i++) {
//                 const credentials = getUserCredentials(i, globalUserOffset);
//                 const userKey = globalUserOffset + i;
//                 const vuId = globalVuOffset + i - 1;
                
//                 // ✅ Step 1: Regular Login
//                 const loginPayload = JSON.stringify({
//                     password: credentials.password,
//                     email: credentials.email,
//                     recaptcha: '',
//                 });

//                 const loginHeaders = {
//                     'Content-Type': 'application/json',
//                     'Accept-Language': 'en',
//                     'Connection': 'keep-alive',
//                     'Accept-Encoding': 'gzip, deflate, br',
//                     'Accept': '*/*',
//                     'User-Agent': 'PostmanRuntime/7.43.0'
//                 };

//                 const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
                
//                 if (loginRes.status === 200) {
//                     totalLoginSuccess++;
//                     const token = loginRes.json().data.token;
                    
//                     tokens[userKey] = { 
//                         email: credentials.email, 
//                         token: token,
//                         pin_token: null,
//                         bp: bp
//                     };
                    
//                     // ✅ Step 2: PIN Login (UNTUK SEMUA USER)
//                     const pinPayload = JSON.stringify({ value: "123456" });
//                     const pinHeaders = {
//                         'Cookie': `ACCESS_TOKEN=${token}`,
//                         'Content-Type': 'application/json',
//                         'Accept-Language': 'en',
//                         'Connection': 'keep-alive',
//                         'Accept-Encoding': 'gzip, deflate, br',
//                         'Accept': '*/*',
//                     };

//                     const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

//                     if (pinRes.status === 200) {
//                         totalPinSuccess++;
//                         tokens[userKey].pin_token = pinRes.json().data.pin_token;
//                     } else {
//                         totalPinFailed++;
//                         if (i === batchStart || totalPinFailed <= 5) {
//                             console.error(`   ❌ User ${userKey} (VU${vuId}) PIN FAILED - Status: ${pinRes.status}`);
//                         }
//                         tokens[userKey].pin_token = null;
//                     }
                    
//                     // ✅ Step 3 dan seterusnya tambahkan jika ada
                    
//                 } else {
//                     totalLoginFailed++;
//                     if (i === batchStart || totalLoginFailed <= 5) {
//                         console.error(`   ❌ User ${userKey} (VU${vuId}) LOGIN FAILED - Status: ${loginRes.status}`);
//                     }
//                     tokens[userKey] = { 
//                         email: credentials.email, 
//                         token: null,
//                         pin_token: null,
//                         bp: bp
//                     };
//                 }
//             }
            
//             console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
//             // Delay between batches
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
    
//     console.log(`   ✅ PIN: ${totalPinSuccess}/${TOTAL_USER} success (${((totalPinSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
//     if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    
//     console.log(`\n📋 Per-BP Summary:`);
//     selectedBPs.forEach(bp => {
//         const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
//         const logins = bpTokens.filter(t => t.token !== null).length;
//         const pins = bpTokens.filter(t => t.pin_token !== null).length;
        
//         console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs`);
//     });
    
//     console.log(`\n🎉 Setup completed!`);
    
//     return { 
//         base_url: base_url, 
//         tokens: tokens,
//         vuMapping: vuMapping
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
//             bp_name = selectedBPs[0];
//         } else if (selectedBPs.length > 1) {
//             const nums = selectedBPs.map(x => parseInt(x.replace('BP', '')))
//                 .filter(x => !isNaN(x))
//                 .sort((a, b) => a - b);
            
//             if (nums.length > 0) {
//                 const min = String(nums[0]).padStart(3, '0');
//                 const max = String(nums[nums.length - 1]).padStart(3, '0');
//                 bp_name = `BP${min}-BP${max}`;
//             }
//         }
        
//         console.log(`[${dateStr}_${timeStr}] Starting report generation for ${bp_name}...`);
        
//         if(`${__ENV.RUNBY}`=='Manual'){
//             const htmlPath = `../../Report/Growin_Eipo_Stock/iOS/${SCENARIO}/Manual/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
//             console.log(`Generating HTML: ${htmlPath}`);
            
//             return {
//                 [htmlPath]: htmlReport(data),
//                 'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//             };
//         } else if(`${__ENV.RUNBY}`=='Regression'){
//             const htmlPath = `../../Report/Growin_Eipo_Stock/iOS/${SCENARIO}/Regression/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
//             console.log(`Generating HTML: ${htmlPath}`);
            
//             return {
//                 [htmlPath]: htmlReport(data),
//                 'stdout': textSummary(data, { indent: ' ', enableColors: true }),
//             };
//         } else if(`${__ENV.RUNBY}`=='LoadTest'){
//             const htmlPath = `../../Report/Growin_Eipo_Stock/iOS/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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

// Command
// Run Multiple BP
// ../../../k6 run Growin_Eipo_Stock_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP Web
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=335 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP001/Manual/Manual_DryRun_0413_1424_BP001.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP002/Manual/Manual_DryRun_0410_1629_BP002.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP003 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP003/Manual/Manual_DryRun_0410_1631_BP003.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP004 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_0401_1043_BP004.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP005 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP005/Manual/Manual_DryRun_0408_1458_BP005.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP006 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP006/Manual/Manual_DryRun_0312_1035_BP006.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP007 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_0408_1500_BP007.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP008 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP008/Manual/Manual_DryRun_0312_1132_BP008.html
// ../../k6 run Growin_Eipo_Stock.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP009 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Eipo_Stock/iOS/BP009/Manual/Manual_DryRun_0312_1134_BP009.html

import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../Helper/config.js';
import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';
import { BP001 as BP001_Web } from "./iOS/BP001.js";
import { BP002 as BP002_Web } from "./iOS/BP002.js";
import { BP003 as BP003_Web } from "./iOS/BP003.js";
import { BP004 as BP004_Web } from "./iOS/BP004.js";
import { BP005 as BP005_Web } from "./iOS/BP005.js";
import { BP006 as BP006_Web } from "./iOS/BP006.js";
import { BP007 as BP007_Web } from "./iOS/BP007.js";
import { BP008 as BP008_Web } from "./iOS/BP008.js";
import { BP009 as BP009_Web } from "./iOS/BP009.js";

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
    console.error('   Example: -e PLATFORM=Android, -e PLATFORM=iOS, -e PLATFORM=iOS');
    return 'Web'; // default fallback
}

const platform = getPlatform();

// Export BP yang tepat berdasarkan platform
export const BP001 = platform === 'Android' ? BP001_Android : BP001_Web;
export const BP002 = platform === 'Android' ? BP002_Android : BP002_Web;
export const BP003 = platform === 'Android' ? BP003_Android : BP003_Web;
export const BP004 = platform === 'Android' ? BP004_Android : BP004_Web;
export const BP005 = platform === 'Android' ? BP005_Android : BP005_Web;
export const BP006 = platform === 'Android' ? BP006_Android : BP006_Web;
export const BP007 = platform === 'Android' ? BP007_Android : BP007_Web;
export const BP008 = platform === 'Android' ? BP008_Android : BP008_Web;
export const BP009 = platform === 'Android' ? BP009_Android : BP009_Web;

// ✅ RETRY CONFIGURATION
// const MAX_RETRY_ATTEMPTS = 10;
// const RETRY_DELAY = 1; // seconds between retry attempts

// ✅ BP_CONFIG: percentage + executor per BP
const BP_CONFIG = {
    BP001: { percentage: 20.5, executor: 'constant-vus' },
    BP002: { percentage: 10.5, executor: 'constant-vus' },
    BP003: { percentage: 30.5, executor: 'constant-vus' },
    BP004: { percentage: 10.5, executor: 'constant-vus' },
    BP005: { percentage: 20.5, executor: 'constant-vus' },
    BP006: { percentage: 5.5, executor: 'constant-arrival-rate', rate: 5 },
    BP007: { percentage: 0.5, executor: 'constant-arrival-rate', rate: 5 },
    BP008: { percentage: 1.0, executor: 'constant-arrival-rate', rate: 5 },
    BP009: { percentage: 0.5, executor: 'constant-vus' },
};

// ✅ Function untuk calculate user distribution
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
    // User bisa input: BP001 atau BP001,BP002
    selectedBPs = SCENARIO.split(',').map(s => s.trim());
} else {
    // Default: jalankan semua BP
    selectedBPs = Object.keys(BP_CONFIG);
}

const userDistribution = calculateUserDistribution(TOTAL_USER, selectedBPs);

console.log('📊 User Distribution:');
Object.keys(userDistribution).forEach(bp => {
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_CONFIG[bp].percentage}%)`);
});
console.log(`   TOTAL: ${TOTAL_USER} users`);
console.log(`   PLATFORM: ${platform}`);

// const scenarios = {};
// selectedBPs.forEach(bp => {
//     const config = BP_CONFIG[bp];
//     const userCount = userDistribution[bp] || 1;

//     if (config.executor === 'constant-arrival-rate') {
//         // ✅ Ensure maxVUs is ALWAYS greater than preAllocatedVUs
//         const preAllocated = Math.max(2, Math.ceil(userCount * 0.3));  // Minimum 2 VUs
//         const maxVUs = Math.max(preAllocated + 5, userCount);          // At least 5 more than preAllocated

//         scenarios[bp] = {
//             executor: 'constant-arrival-rate',
//             rate: config.rate,
//             timeUnit: '1s',
//             duration: `${__ENV.DURATION}`,
//             preAllocatedVUs: preAllocated,
//             maxVUs: maxVUs,
//             exec: bp,
//         };

//         console.log(`   🔧 ${bp}: preAllocated=${preAllocated}, maxVUs=${maxVUs}, rate=${config.rate}/s`);
//     } else {
//         scenarios[bp] = {
//             executor: 'constant-vus',
//             vus: userCount,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '30s',
//             exec: bp,
//         };
//     }
// });
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

export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
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
//         'X-Device-Id': 'TEST3'
//     };

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
//                     ];

//                     const profileRequests = [
//                         ['GET', profileUrls[0], null, { headers: profileHeaders }],
//                     ];

//                     const profileResponses = http.batch(profileRequests);

//                     // Handle profile/trading (index 0)
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