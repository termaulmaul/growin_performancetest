// Command
// Run Multiple BP
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=2h -e NUMSTART=1001 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/LoadTest/Manual_LoadTest_1208_1413.html

// Run Single BP
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=63 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP001/Manual/Manual_DryRun_1217_1401_BP001_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=31 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP002/Manual/Manual_DryRun_1113_1708_BP002_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=94 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP003/Manual/Manual_DryRun_1209_1343_BP003_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=31 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP004 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_1113_1708_BP004_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=63 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP005 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP005/Manual/Manual_DryRun_1113_1708_BP005_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=15 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP006 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP006/Manual/Manual_DryRun_1209_1406_BP006_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=205 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP007 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_1208_1048_BP007_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP008 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP007/Manual/Manual_DryRun_1119_1127_BP008_Local.html
// ../../../k6 run Growin_Eipo_Stock_iOS_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP009 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP009/Manual/Manual_DryRun_1120_1347_BP009_Local.html

import { textSummary } from "../../../Helper/textSummary.js";
import { htmlReport } from '../../../Helper/bundle.js';
import { BP001 } from "./BP001.js";
import { BP002 } from "./BP002.js";
import { BP003 } from "./BP003.js";
import { BP004 } from "./BP004.js";
import { BP005 } from "./BP005.js";
import { BP006 } from "./BP006.js";
import { BP007 } from "./BP007.js";
import { BP008 } from "./BP008.js";
import { BP009 } from "./BP009.js";
import http from "k6/http";
import { sleep } from "k6";

export { BP001, BP002, BP003, BP004, BP005, BP006, BP007, BP008, BP009 }

// ✅ DEFINISI PERSENTASE USER PER BP
// const BP_USER_PERCENTAGE = {
//     BP001: 20.5,
//     BP002: 10.5,
//     BP003: 30.5,
//     BP004: 10.5,
//     BP005: 20.5,
//     BP006: 5.5,
//     BP007: 0.5,
//     BP008: 1.0,
//     BP009: 0.5,
// };

const BP_CONFIG = {
    BP001: { percentage: 20.5, executor: 'constant-vus' },
    BP002: { percentage: 10.5, executor: 'constant-vus' },
    BP003: { percentage: 30.5, executor: 'constant-vus' },
    BP004: { percentage: 10.5, executor: 'constant-vus' },
    BP005: { percentage: 20.5, executor: 'constant-arrival-rate', rate: 5 },
    BP006: { percentage: 5.5, executor: 'constant-vus' },
    BP007: { percentage: 0.5, executor: 'constant-arrival-rate', rate: 5 },
    BP008: { percentage: 1.0, executor: 'constant-vus' },
    BP009: { percentage: 0.5, executor: 'constant-arrival-rate', rate: 5 },
};

// ✅ Function untuk calculate user distribution
function calculateUserDistribution(totalUsers, selectedBPs) {
    const distribution = {};
    let totalPercentage = 0;
    
    selectedBPs.forEach(bp => {
        totalPercentage += BP_CONFIG[bp]?.percentage || 0;  // ✅ Access .percentage property
    });
    
    if (totalPercentage === 0) {
        console.error('❌ No valid BP selected or percentage not defined!');
        return distribution;
    }
    
    let allocatedUsers = 0;
    selectedBPs.forEach((bp, index) => {
        const percentage = BP_CONFIG[bp].percentage;  // ✅ Get the percentage value
        
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
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_CONFIG[bp].percentage}%)`);  // ✅ Fixed
});
console.log(`   TOTAL: ${TOTAL_USER} users`);

const scenarios = {};
selectedBPs.forEach(bp => {
    const config = BP_CONFIG[bp];
    const userCount = userDistribution[bp] || 1;
    
    if (config.executor === 'constant-arrival-rate') {
        // ✅ CRITICAL FIX: Ensure maxVUs is ALWAYS greater than preAllocatedVUs
        const preAllocated = Math.max(2, Math.ceil(userCount * 0.3));  // Minimum 2 VUs
        const maxVUs = Math.max(preAllocated + 5, userCount);  // At least 5 more than preAllocated
        
        scenarios[bp] = {
            executor: 'constant-arrival-rate',
            rate: config.rate,
            timeUnit: '1s',
            duration: `${__ENV.DURATION}`,
            preAllocatedVUs: preAllocated,
            maxVUs: maxVUs,
            exec: bp,
        };
        
        console.log(`   🔧 ${bp}: preAllocated=${preAllocated}, maxVUs=${maxVUs}, rate=${config.rate}/s`);
    } else {
        scenarios[bp] = {
            executor: 'constant-vus',
            vus: userCount,
            duration: `${__ENV.DURATION}`,
            gracefulStop: '30s',
            exec: bp,
        };
    }
});

export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s', // ✅ Increased for large user counts
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
}

function getBaseUrl() {
    if(`${__ENV.ENV}`=='DEV'){
        return 'https://dev-api.growin.id';
    } else if ((`${__ENV.ENV}`=='QA')) {
        return 'https://api-qa.growin.id';
    } else if (`${__ENV.ENV}`=='DRC') {
        return 'https://drc-api.growin.id';
    } else if (`${__ENV.ENV}`=='INT') {
        return 'https://internal-api-pt.growin.id';
    }
    return 'https://internal-api-pt.growin.id';
}

function getUserCredentials(userNum, bpOffset = 0) {
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    const actualUserNum = userNum + bpOffset;
    let email = '';
    let formattedNum = '';
    
    if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
        formattedNum = String(startNum + actualUserNum - 1).padStart(3, '0');
        email = 'mostng' + formattedNum + '@guysmail.com';
    } else if (`${__ENV.ENV}`=='DRC') {
        formattedNum = String(startNum + actualUserNum - 1).padStart(0, '0');
        email = 'MOSTNG' + formattedNum + '@guysmail.com';
    } else if (`${__ENV.ENV}`=='INT') {
        formattedNum = String(startNum + actualUserNum - 1).padStart(2, '0');
        email = 'TESTMON' + formattedNum + '@guysmail.com';
    }
    
    return { email: email, password: 'M@nsek.123' };
}

// ✅ SETUP FUNCTION - SEMUA BP mendapat PIN dan UUID
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    const BATCH_SIZE = 500; // Process 50 users at a time
    const BATCH_DELAY = 0; // 3 seconds between batches
    
    console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔑 ALL users will get PIN token`);
    
    let globalUserOffset = 0;
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    
    selectedBPs.forEach((bp, bpIndex) => {
        const usersForThisBP = userDistribution[bp];
        
        console.log(`\n📦 Processing ${bp} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
        // Create VU mapping
        for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
            const vuId = globalVuOffset + localUserIndex - 1;
            vuMapping[vuId] = {
                bp: bp,
                userKey: globalUserOffset + localUserIndex
            };
        }
        
        // ✅ Process in batches
        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE + 1;
            const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey = globalUserOffset + i;
                const vuId = globalVuOffset + i - 1;
                
                // ✅ Step 1: Regular Login
                const loginPayload = JSON.stringify({
                    password: credentials.password,
                    email: credentials.email,
                    recaptcha: '',
                });

                const loginHeaders = {
                    'Content-Type': 'application/json',
                    'Accept-Language': 'en',
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': '*/*',
                    'User-Agent': 'PostmanRuntime/7.43.0'
                };

                const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
                
                if (loginRes.status === 200) {
                    totalLoginSuccess++;
                    const token = loginRes.json().data.token;
                    
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: token,
                        pin_token: null,
                        bp: bp
                    };
                    
                    // ✅ Step 2: PIN Login (UNTUK SEMUA USER)
                    const pinPayload = JSON.stringify({ value: "123456" });
                    const pinHeaders = {
                        'Cookie': `ACCESS_TOKEN=${token}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': 'en',
                        'Connection': 'keep-alive',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept': '*/*',
                    };

                    const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

                    if (pinRes.status === 200) {
                        totalPinSuccess++;
                        tokens[userKey].pin_token = pinRes.json().data.pin_token;
                    } else {
                        totalPinFailed++;
                        if (i === batchStart || totalPinFailed <= 5) {
                            console.error(`   ❌ User ${userKey} (VU${vuId}) PIN FAILED - Status: ${pinRes.status}`);
                        }
                        tokens[userKey].pin_token = null;
                    }
                    
                    // ✅ Step 3 dan seterusnya tambahkan jika ada
                    
                } else {
                    totalLoginFailed++;
                    if (i === batchStart || totalLoginFailed <= 5) {
                        console.error(`   ❌ User ${userKey} (VU${vuId}) LOGIN FAILED - Status: ${loginRes.status}`);
                    }
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: null,
                        pin_token: null,
                        bp: bp
                    };
                }
            }
            
            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
            // Delay between batches
            if (batchNum < numBatches - 1) {
                sleep(BATCH_DELAY);
            }
        }
        
        globalUserOffset += usersForThisBP;
        globalVuOffset += usersForThisBP;
    });
    
    // ✅ Summary
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login: ${totalLoginSuccess}/${TOTAL_USER} success (${((totalLoginSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
    if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
    
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
        vuMapping: vuMapping
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
            const nums = selectedBPs.map(x => parseInt(x.replace('BP', '')))
                .filter(x => !isNaN(x))
                .sort((a, b) => a - b);
            
            if (nums.length > 0) {
                const min = String(nums[0]).padStart(3, '0');
                const max = String(nums[nums.length - 1]).padStart(3, '0');
                bp_name = `BP${min}-BP${max}`;
            }
        }
        
        console.log(`[${dateStr}_${timeStr}] Starting report generation for ${bp_name}...`);
        
        if(`${__ENV.RUNBY}`=='Manual'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/${SCENARIO}/Manual/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/${SCENARIO}/Regression/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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