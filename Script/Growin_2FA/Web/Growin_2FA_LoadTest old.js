// Command
// Run Multiple BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=2h -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_2FA/Web/LoadTest/Manual_LoadTest_0111_1402.html

// Run Single BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=101 -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_2FA/Web/BP001/Manual/Manual_DryRun_0111_1058_BP001_Local.html
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=500 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_2FA/Web/BP002/Manual/Manual_DryRun_0120_0951_BP002_Local.html
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e NUMSTART=1 -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_2FA/Web/BP003/Manual/Manual_DryRun_0120_0935_BP003_Local.html

import { textSummary } from "../../../Helper/textSummary.js";
import { htmlReport } from '../../../Helper/bundle.js';
import { BP002 } from "./BP002.js";
import { BP003 } from "./BP003.js";
import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";

export { BP002, BP003 }

// ✅ DEFINISI PERSENTASE USER PER BP
const BP_USER_PERCENTAGE = {
    BP002: 80,
    BP003: 20,
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
        // executor: 'constant-vus',
        // vus: userDistribution[bp] || 1,
        // duration: `${__ENV.DURATION}`,
        // gracefulStop: '30s',

        executor: 'per-vu-iterations',
        vus: 5000,
        iterations: 1,
        maxDuration: '1h',

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

// ✅ Export function agar bisa dipakai BP001
export function getUserCredentials(userNum, bpOffset = 0) {
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

// ✅ SETUP FUNCTION - SEKARANG MELAKUKAN LOGIN + PIN UNTUK SEMUA USER
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    const BATCH_SIZE = 500; // Process users in batches
    const BATCH_DELAY = 2; // Seconds between batches
    
    console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔑 ALL users will get TOKEN + PIN`);
    
    let globalUserOffset = 0;
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    
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
        
        // ✅ Process users in batches
        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE + 1;
            const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey = globalUserOffset + i;
                const vuId = globalVuOffset + i - 1;
                
                // ✅ Step 1: Login
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
                    'X-Device-Id': 'TEST3'
                };

                const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });
                
                // console.log(`loginRes: ${loginRes.body}`)

                if (loginRes.status === 200) {
                    totalLoginSuccess++;
                    const token = loginRes.json().data.token;
                    
                    // Initialize token data
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: token,
                        pin_token: null,
                        bp: bp
                    };
                    
                    // ✅ Step 2: PIN Login
                    const pinPayload = JSON.stringify({ value: "123456" });
                    const pinHeaders = {
                        'Cookie': `ACCESS_TOKEN=${token}`,
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

                    // console.log(`pinRes: ${pinRes.body}`)

                    if (pinRes.status === 200) {
                        totalPinSuccess++;
                        tokens[userKey].pin_token = pinRes.json().data.pin_token;
                    } else {
                        totalPinFailed++;
                        if (i === batchStart || totalPinFailed <= 5) {
                            console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) PIN FAILED - Status: ${pinRes.status} - Body: ${pinRes.body}`);
                        }
                        tokens[userKey].pin_token = null;
                    }
                    
                } else {
                    totalLoginFailed++;
                    if (i === batchStart || totalLoginFailed <= 5) {
                        console.error(`   ❌ User ${userKey} ${credentials.email} (VU${vuId}) LOGIN FAILED - Status: ${loginRes.status} - Body: ${loginRes.body}`);
                    }
                    // Store with null tokens
                    tokens[userKey] = { 
                        email: credentials.email, 
                        token: null,
                        pin_token: null,
                        bp: bp
                    };
                }
            }
            
            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
            // Delay between batches to avoid overwhelming API
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
            const htmlPath = `../../../Report/Growin_2FA/Web/${SCENARIO}/Manual/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_2FA/Web/${SCENARIO}/Regression/${__ENV.RUNBY}_Detail_${SCENARIO}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_2FA/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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