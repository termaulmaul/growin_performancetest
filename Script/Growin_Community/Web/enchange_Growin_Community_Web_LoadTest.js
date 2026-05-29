// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Community/Web/Growin_Community_Web_LoadTest.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

// Command
// Run Multiple BP
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/Web/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=2m -e NUMSTART=101 -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_Community/Web/BP001/Manual/Manual_DryRun_0123_0936_BP001_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=2m -e NUMSTART=101 -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_Community/Web/BP002/Manual/Manual_DryRun_0123_0939_BP002_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=15m -e NUMSTART=101 -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_Community/Web/BP003/Manual/Manual_DryRun_0202_1056_BP003_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=5m -e NUMSTART=2051 -e SCENARIO=BP004 --out dashboard=export=../../../Report/Growin_Community/Web/BP004/Manual/Manual_DryRun_1219_1442_BP004_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP005 --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_0127_2214_BP005_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP006 --out dashboard=export=../../../Report/Growin_Community/Web/BP006/Manual/Manual_DryRun_0202_1513_BP006_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP007 --out dashboard=export=../../../Report/Growin_Community/Web/BP007/Manual/Manual_DryRun_1218_2016_BP007_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=75 -e DURATION=5m -e NUMSTART=2001 -e SCENARIO=BP008 --out dashboard=export=../../../Report/Growin_Community/Web/BP008/Manual/Manual_DryRun_1203_2010_BP008_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP009 --out dashboard=export=../../../Report/Growin_Community/Web/BP009/Manual/Manual_DryRun_1217_1455_BP009_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP010 --out dashboard=export=../../../Report/Growin_Community/Web/BP010/Manual/Manual_DryRun_1217_1501_BP010_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=50 -e DURATION=5m -e NUMSTART=2001 -e SCENARIO=BP011 --out dashboard=export=../../../Report/Growin_Community/Web/BP011/Manual/Manual_DryRun_1203_2018_BP011_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=250 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP012 --out dashboard=export=../../../Report/Growin_Community/Web/BP012/Manual/Manual_DryRun_1227_1615_BP012_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=25 -e DURATION=1m -e NUMSTART=2051 -e SCENARIO=BP013 --out dashboard=export=../../../Report/Growin_Community/Web/BP013/Manual/Manual_DryRun_1227_1807_BP013_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=50 -e DURATION=5m -e NUMSTART=2001 -e SCENARIO=BP014 --out dashboard=export=../../../Report/Growin_Community/Web/BP014/Manual/Manual_DryRun_1227_1627_BP014_Local.html

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
import { BP010 } from "./BP010.js";
import { BP011 } from "./BP011.js";
import { BP012 } from "./BP012.js";
import { BP013 } from "./BP013.js";
import { BP014 } from "./BP014.js";
import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

export { BP001, BP002, BP003, BP004, BP005, BP006, BP007, BP008, BP009, BP010, BP011, BP012, BP013, BP014 }

// ✅ DEFINISI PERSENTASE USER PER BP
const BP_USER_PERCENTAGE = {
    BP001: 40,
    BP002: 10,
    BP003: 10,
    BP004: 0.25,
    BP005: 5,
    BP006: 5,
    BP007: 5,
    BP008: 0.25,
    BP009: 9.5,
    BP010: 10,
    BP011: 1,
    BP012: 2,
    BP013: 1,
    BP014: 1,
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

const scenarios = {};
selectedBPs.forEach(bp => {
    scenarios[bp] = {
        // executor: 'per-vu-iterations',
        // vus: 400,
        // iterations: 1,
        // maxDuration: '1h',

        // executor: 'ramping-vus',
        // startVUs: 0,
        // stages: [
        //     { duration: '5m', target: 100 },
        //     { duration: '5m', target: 100 },
        //     { duration: '5m', target: 200 },
        //     { duration: '5m', target: 200 },
        //     { duration: '5m', target: 300 },
        //     { duration: '5m', target: 300 },
        //     { duration: '5m', target: 400 },
        //     { duration: '5m', target: 400 },

        //     { duration: '5m', target: 500 },
        //     { duration: '5m', target: 500 },
        //     { duration: '5m', target: 600 },
        //     { duration: '5m', target: 600 },
        //     { duration: '5m', target: 700 },
        //     { duration: '5m', target: 700 },
        //     { duration: '5m', target: 800 },
        //     { duration: '5m', target: 800 },

        //     { duration: '5m', target: 900 },
        //     { duration: '5m', target: 900 },
        //     { duration: '5m', target: 1000 },
        //     { duration: '5m', target: 1000 },
        //     { duration: '5m', target: 1100 },
        //     { duration: '5m', target: 1100 },
        //     { duration: '5m', target: 1200 },
        //     { duration: '5m', target: 1200 },

        //     { duration: '5m', target: 1300 },
        //     { duration: '5m', target: 1300 },
        //     { duration: '5m', target: 1400 },
        //     { duration: '5m', target: 1400 },
        //     { duration: '5m', target: 1500 },
        //     { duration: '5m', target: 1500 },
        //     { duration: '5m', target: 1600 },
        //     { duration: '5m', target: 1600 },

        //     // { duration: '5m', target: 1700 },
        //     // { duration: '5m', target: 1700 },
        //     // { duration: '5m', target: 1800 },
        //     // { duration: '5m', target: 1800 },
        //     // { duration: '5m', target: 1900 },
        //     // { duration: '5m', target: 1900 },
        //     // { duration: '5m', target: 2000 },
        //     // { duration: '5m', target: 2000 },
        //     { duration: '5m', target: 0 },      // ramp down
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

// ✅ SETUP FUNCTION - SEMUA BP mendapat PIN
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    const BATCH_SIZE = 500; // Process 50 users at a time
    const BATCH_DELAY = 2; // 3 seconds between batches
    
    console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔑 ALL users will get PIN token`);
    
    let globalUserOffset = 0;
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    
    // ✅ Object untuk menyimpan channel_id per BP
    const channelIds = {};
    
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
                    'Accept': '*/*',
                    'Accept-Language': 'en',
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
                    'X-App-Name': 'web',
                    'X-App-Version': '1.4.1',
                    'X-Device-Info': 'iPhone 11',
                    // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3'
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
                        'Content-Type': 'application/json',
                        'Accept': '*/*',
                        'Accept-Language': 'en',
                        'Connection': 'keep-alive',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Cookie': `ACCESS_TOKEN=${token};`,
                        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
                        'X-App-Name': 'web',
                        'X-App-Version': '1.4.1',
                        'X-Device-Info': 'iPhone 11',
                        'X-Device-Id': 'TEST3'
                    };

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
        const channelId = channelIds[bp] || 'N/A';
        
        console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins}/${bpTokens.length} PINs, channel_id: ${channelId}`);
    });
    
    console.log(`\n🎉 Setup completed!`);
    
    return { 
        base_url: base_url, 
        tokens: tokens,
        vuMapping: vuMapping,
        channelIds: channelIds  // ✅ Pass channelIds object ke semua BP functions
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
            const htmlPath = `../../../Report/Growin_Community/Web/${SCENARIO}/Manual/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/Web/${SCENARIO}/Regression/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/Web/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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