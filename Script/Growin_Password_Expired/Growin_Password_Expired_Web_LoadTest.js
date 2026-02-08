// Command
// Run Multiple BP
// ../../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=5m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/Web/LoadTest/Manual_LoadTest_0107_1459.html

// Run Single BP Android
// ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Community/Android/BP001/Manual/Manual_DryRun_0203_1640_BP001_Local.html
// ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=Android --out dashboard=export=../../Report/Growin_Community/Android/BP002/Manual/Manual_DryRun_0113_1554_BP002_Local.html

// Run Single BP iOS
// ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP001 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Community/iOS/BP001/Manual/Manual_DryRun_0113_1659_BP001_Local.html
// ../../k6 run Growin_Password_Expired_Web_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 -e PLATFORM=iOS --out dashboard=export=../../Report/Growin_Community/iOS/BP002/Manual/Manual_DryRun_0113_1554_BP002_Local.html

import { textSummary } from "../../Helper/textSummary.js";
import { htmlReport } from '../../Helper/bundle.js';
import { BP001 as BP001_Android } from "./Android/BP001.js";
import { BP002 as BP002_Android } from "./Android/BP002.js";
import { BP001 as BP001_iOS } from "./iOS/BP001.js";
import { BP002 as BP002_iOS } from "./iOS/BP002.js";

import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";

function getPlatform() {
    const { PLATFORM } = __ENV;
    
    if (PLATFORM && ['Android', 'iOS'].includes(PLATFORM)) {
        return PLATFORM;
    }
    
    console.error('❌ PLATFORM must be specified: Android or iOS');
    console.error('   Example: -e PLATFORM=Android or -e PLATFORM=iOS');
    return 'Android'; // default fallback
}

const platform = getPlatform();

// Export BP yang tepat berdasarkan platform
export const BP001 = platform === 'iOS' ? BP001_iOS : BP001_Android;
export const BP002 = platform === 'iOS' ? BP002_iOS : BP002_Android;

// ✅ RETRY CONFIGURATION
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 1; // seconds between retry attempts

const BP_USER_PERCENTAGE = {
    BP001: 50,
    BP002: 50,
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

// ✅ LOGIN WITH RETRY - Max 10 attempts
function loginWithRetry(base_url, credentials, userKey, vuId) {
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
    
    return {
        success: false,
        token: null,
        attempts: MAX_RETRY_ATTEMPTS
    };
}

export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    const BATCH_SIZE = 500; // Process 500 users at a time
    const BATCH_DELAY = 2; // 2 seconds between batches
    
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
    let totalLoginRetries = 0;
    
    // ✅ Object untuk menyimpan channel_id per BP
    const channelIds = {};
    
    selectedBPs.forEach((bp, bpIndex) => {
        const usersForThisBP = userDistribution[bp];
        
        console.log(`\n📦 Processing ${bp} on ${platform} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        
        // Create VU mapping
        for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
            const vuId = globalVuOffset + localUserIndex - 1;
            vuMapping[vuId] = {
                bp: bp,
                userKey: globalUserOffset + localUserIndex
            };
        }
        
        // ✅ Process in batches with retry
        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE + 1;
            const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Users ${batchStart}-${batchEnd}`);
            
            for (let i = batchStart; i <= batchEnd; i++) {
                const credentials = getUserCredentials(i, globalUserOffset);
                const userKey = globalUserOffset + i;
                const vuId = globalVuOffset + i - 1;
                
                // ✅ Step 1: Login with retry
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
                    
                    // ✅ Step 2: PIN Login (UNTUK SEMUA USER)
                    const pinPayload = JSON.stringify({ value: "123456" });
                    const pinHeaders = {
                        'Content-Type': 'application/json',
                        'Accept': '*/*',
                        'Accept-Language': 'en',
                        'Connection': 'keep-alive',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Cookie': `ACCESS_TOKEN=${loginResult.token};`,
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
    
    
    // ✅ Summary
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
            const htmlPath = `../../Report/Growin_Password_Expired/${platform}/${bp_name}/Manual/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'Regression') {
            const htmlPath = `../../Report/Growin_Password_Expired/${platform}/${bp_name}/Regression/${runby}_Detail_${bp_name}_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if (runby === 'LoadTest') {
            const htmlPath = `../../Report/Growin_Password_Expired/${platform}/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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