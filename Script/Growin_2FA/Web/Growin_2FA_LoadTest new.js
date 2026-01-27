// Command
// Run Multiple BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=400 -e DURATION=2h -e NUMSTART=1 --out dashboard=export=../../../Report/Growin_2FA/Web/LoadTest/Manual_LoadTest_0120_1402.html

// Run Single BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=320 -e DURATION=15m -e NUMSTART=1 -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_2FA/Web/BP002/Manual/Manual_DryRun_0120_1058_BP002_Local.html
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=80 -e DURATION=5m -e NUMSTART=321 -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_2FA/Web/BP003/Manual/Manual_DryRun_0120_0951_BP003_Local.html

import { textSummary } from "../../../Helper/textSummary.js";
import { htmlReport } from '../../../Helper/bundle.js';
import { BP002 } from "./BP002.js";
import { BP003 } from "./BP003.js";
import http from "k6/http";
import { sleep } from "k6";
import { Rate } from "k6/metrics";

export { BP002, BP003 }

// ✅ DEFINISI KONFIGURASI USER PER BP (EXPLICIT RANGE)
const BP_CONFIG = {
    BP002: {
        percentage: 80,
        startUser: 1,
        endUser: 320
    },
    BP003: {
        percentage: 20,
        startUser: 321,
        endUser: 400
    }
};

// ✅ Function untuk calculate user distribution dengan explicit range
function calculateUserDistribution(totalUsers, selectedBPs) {
    const distribution = {};
    
    selectedBPs.forEach(bp => {
        const config = BP_CONFIG[bp];
        if (!config) {
            console.error(`❌ No config found for ${bp}`);
            return;
        }
        
        const expectedUsers = config.endUser - config.startUser + 1;
        
        distribution[bp] = {
            users: expectedUsers,
            startUser: config.startUser,
            endUser: config.endUser,
            percentage: config.percentage
        };
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

// ✅ Validation: Check if TOTAL_USER matches sum of all BP users
let calculatedTotal = 0;
Object.keys(userDistribution).forEach(bp => {
    calculatedTotal += userDistribution[bp].users;
});

if (calculatedTotal !== TOTAL_USER) {
    console.warn(`⚠️ WARNING: TOTAL_USER (${TOTAL_USER}) doesn't match calculated total (${calculatedTotal})`);
    console.warn(`   This might cause issues. Recommended TOTAL_USER: ${calculatedTotal}`);
}

console.log('📊 User Distribution:');
Object.keys(userDistribution).forEach(bp => {
    const config = userDistribution[bp];
    console.log(`   ${bp}: ${config.users} users (${config.percentage}%) - User ${config.startUser} to ${config.endUser}`);
});
console.log(`   TOTAL: ${calculatedTotal} users`);

const scenarios = {};
selectedBPs.forEach(bp => {
    scenarios[bp] = {
        executor: 'per-vu-iterations',
        vus: userDistribution[bp].users,
        iterations: 1,
        maxDuration: '1h',
        exec: bp,
    };
});

export const options = {
    scenarios: scenarios,
    noConnectionReuse: false,
    setupTimeout: '3600s',
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

// ✅ Simplified getUserCredentials - no offset needed
export function getUserCredentials(userNum) {
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 1;
    let email = '';
    let formattedNum = '';
    
    if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
        formattedNum = String(userNum).padStart(3, '0');
        email = 'mostng' + formattedNum + '@guysmail.com';
    } else if (`${__ENV.ENV}`=='DRC') {
        formattedNum = String(userNum).padStart(0, '0');
        email = 'MOSTNG' + formattedNum + '@guysmail.com';
    } else if (`${__ENV.ENV}`=='INT') {
        formattedNum = String(userNum).padStart(2, '0'); // ✅ Changed to 3 digits to support 400 users
        email = 'TESTMON' + formattedNum + '@guysmail.com';
    }
    
    return { email: email, password: 'M@nsek.123' };
}

// ✅ SETUP FUNCTION - LOGIN + PIN dengan explicit user range per BP
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    const BATCH_SIZE = 500;
    const BATCH_DELAY = 2;
    
    console.log(`🔐 Starting login for ${calculatedTotal} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔑 ALL users will get TOKEN + PIN\n`);
    
    let globalVuOffset = 1;
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    
    selectedBPs.forEach((bp, bpIndex) => {
        const bpConfig = userDistribution[bp];
        const usersForThisBP = bpConfig.users;
        const startUserNum = bpConfig.startUser;
        const endUserNum = bpConfig.endUser;
        
        console.log(`\n📦 Processing ${bp}:`);
        console.log(`   Total Users: ${usersForThisBP}`);
        console.log(`   User Range: ${startUserNum} to ${endUserNum}`);
        console.log(`   VU Range: ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1}`);
        
        const firstEmail = getUserCredentials(startUserNum).email;
        const lastEmail = getUserCredentials(endUserNum).email;
        console.log(`   Email Range: ${firstEmail} to ${lastEmail}`);
        
        // ✅ Create VU mapping dengan user number eksplisit
        for (let userNum = startUserNum; userNum <= endUserNum; userNum++) {
            const localIndex = userNum - startUserNum;
            const vuId = globalVuOffset + localIndex;
            
            vuMapping[vuId] = {
                bp: bp,
                userNum: userNum
            };
        }
        
        // ✅ Process users in batches
        const numBatches = Math.ceil(usersForThisBP / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStartIndex = batchNum * BATCH_SIZE;
            const batchEndIndex = Math.min((batchNum + 1) * BATCH_SIZE, usersForThisBP);
            
            const batchStartUser = startUserNum + batchStartIndex;
            const batchEndUser = startUserNum + batchEndIndex - 1;
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: User ${batchStartUser}-${batchEndUser}`);
            
            for (let i = batchStartIndex; i < batchEndIndex; i++) {
                const actualUserNum = startUserNum + i;
                const credentials = getUserCredentials(actualUserNum);
                const vuId = globalVuOffset + i;
                
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

                if (loginRes.status === 200) {
                    totalLoginSuccess++;
                    const token = loginRes.json().data.token;
                    
                    // ✅ Initialize token data dengan actualUserNum sebagai key
                    tokens[actualUserNum] = { 
                        email: credentials.email, 
                        token: token,
                        pin_token: null,
                        bp: bp,
                        vuId: vuId
                    };
                    
                    // ✅ Step 2: PIN Login
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
                        tokens[actualUserNum].pin_token = pinRes.json().data.pin_token;
                    } else {
                        totalPinFailed++;
                        if (i === batchStartIndex || totalPinFailed <= 5) {
                            console.error(`   ❌ User ${actualUserNum} ${credentials.email} (VU${vuId}) PIN FAILED - Status: ${pinRes.status}`);
                        }
                        tokens[actualUserNum].pin_token = null;
                    }
                    
                } else {
                    totalLoginFailed++;
                    if (i === batchStartIndex || totalLoginFailed <= 5) {
                        console.error(`   ❌ User ${actualUserNum} ${credentials.email} (VU${vuId}) LOGIN FAILED - Status: ${loginRes.status}`);
                    }
                    tokens[actualUserNum] = { 
                        email: credentials.email, 
                        token: null,
                        pin_token: null,
                        bp: bp,
                        vuId: vuId
                    };
                }
            }
            
            console.log(`   ✅ Batch ${batchNum + 1}/${numBatches} completed`);
            
            if (batchNum < numBatches - 1) {
                sleep(BATCH_DELAY);
            }
        }
        
        globalVuOffset += usersForThisBP;
    });
    
    // ✅ Summary
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login: ${totalLoginSuccess}/${calculatedTotal} success (${((totalLoginSuccess/calculatedTotal)*100).toFixed(1)}%)`);
    if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
    
    console.log(`   ✅ PIN: ${totalPinSuccess}/${calculatedTotal} success (${((totalPinSuccess/calculatedTotal)*100).toFixed(1)}%)`);
    if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    
    console.log(`\n📋 Per-BP Summary:`);
    selectedBPs.forEach(bp => {
        const bpConfig = userDistribution[bp];
        const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
        const logins = bpTokens.filter(t => t.token !== null).length;
        const pins = bpTokens.filter(t => t.pin_token !== null).length;
        
        console.log(`   ${bp}: ${logins}/${bpConfig.users} logins, ${pins}/${bpConfig.users} PINs (User ${bpConfig.startUser}-${bpConfig.endUser})`);
    });
    
    // ✅ VU Mapping Verification
    console.log(`\n🔍 VU Mapping Verification (Sample):`);
    const sampleVUs = [1, 160, 320, 321, 360, 400];
    sampleVUs.forEach(vu => {
        if (vuMapping[vu]) {
            const mapping = vuMapping[vu];
            const email = getUserCredentials(mapping.userNum).email;
            console.log(`   VU ${vu}: BP=${mapping.bp}, User=${mapping.userNum}, Email=${email}`);
        }
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