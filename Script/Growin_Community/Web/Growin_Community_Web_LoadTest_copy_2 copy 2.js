// Command
// Run Multiple BP
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=1h --out dashboard=export=../../../Report/Growin_Community/Web/LoadTest/Manual_LoadTest_0107_1450.html

// Run Single BP
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_Community/Web/BP001/Manual/Manual_DryRun_0128_1616_BP001_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_Community/Web/BP002/Manual/Manual_DryRun_1227_1436_BP002_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_Community/Web/BP003/Manual/Manual_DryRun_1227_1443_BP003_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=25 -e DURATION=5m -e SCENARIO=BP004 --out dashboard=export=../../../Report/Growin_Community/Web/BP004/Manual/Manual_DryRun_0129_1129_BP004_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP005 --out dashboard=export=../../../Report/Growin_Community/Web/BP005/Manual/Manual_DryRun_0128_1608_BP005_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=150 -e DURATION=5m -e SCENARIO=BP006 --out dashboard=export=../../../Report/Growin_Community/Web/BP006/Manual/Manual_DryRun_1228_1700_BP006_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP007 --out dashboard=export=../../../Report/Growin_Community/Web/BP007/Manual/Manual_DryRun_1228_1508_BP007_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=75 -e DURATION=5m -e SCENARIO=BP008 --out dashboard=export=../../../Report/Growin_Community/Web/BP008/Manual/Manual_DryRun_1227_1515_BP008_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP009 --out dashboard=export=../../../Report/Growin_Community/Web/BP009/Manual/Manual_DryRun_1227_1521_BP009_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP010 --out dashboard=export=../../../Report/Growin_Community/Web/BP010/Manual/Manual_DryRun_1227_1552_BP010_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=50 -e DURATION=5m -e SCENARIO=BP011 --out dashboard=export=../../../Report/Growin_Community/Web/BP011/Manual/Manual_DryRun_1227_1606_BP011_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e SCENARIO=BP012 --out dashboard=export=../../../Report/Growin_Community/Web/BP012/Manual/Manual_DryRun_1217_1507_BP012_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=25 -e DURATION=5m -e SCENARIO=BP013 --out dashboard=export=../../../Report/Growin_Community/Web/BP013/Manual/Manual_DryRun_1203_2019_BP013_Local.html
// ../../../k6 run Growin_Community_Web_LoadTest_copy_2.js -e RUNBY=Manual -e ENV=INT -e USER=50 -e DURATION=5m -e SCENARIO=BP014 --out dashboard=export=../../../Report/Growin_Community/Web/BP014/Manual/Manual_DryRun_1203_2020_BP014_Local.html

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

export { BP001, BP002, BP003, BP004, BP005, BP006, BP007, BP008, BP009, BP010, BP011, BP012, BP013, BP014 }

// ✅ RETRY CONFIGURATION
const MAX_RETRY_ATTEMPTS = 10;
const RETRY_DELAY = 1; // seconds between retry attempts

// ✅ USER POOL DEFINITIONS
const USER_POOLS = {
    REGULAR: { start: 1, end: 2000 },
    ADMIN: { start: 2001, end: 2050 },
    SUHU: { start: 2051, end: 2100 }
};

// ✅ BP CONFIGURATION - Percentage + Pool Assignment
const BP_CONFIG = {
    BP001: { percentage: 40, pool: 'REGULAR' },
    BP002: { percentage: 10, pool: 'REGULAR' },
    BP003: { percentage: 10, pool: 'REGULAR' },
    BP004: { percentage: 0.25, pool: 'SUHU' },
    BP005: { percentage: 5, pool: 'REGULAR' },
    BP006: { percentage: 5, pool: 'REGULAR' },
    BP007: { percentage: 5, pool: 'REGULAR' },
    BP008: { percentage: 0.25, pool: 'MIXED' }, // SUHU + ADMIN
    BP009: { percentage: 9.5, pool: 'REGULAR' },
    BP010: { percentage: 10, pool: 'REGULAR' },
    BP011: { percentage: 1, pool: 'ADMIN' },
    BP012: { percentage: 2, pool: 'REGULAR' },
    BP013: { percentage: 1, pool: 'SUHU' },
    BP014: { percentage: 1, pool: 'ADMIN' },
};

// ✅ USER POOL MANAGER - Ensures NO user overlap
class UserPoolManager {
    constructor() {
        this.usedUsers = {
            REGULAR: new Set(),
            ADMIN: new Set(),
            SUHU: new Set()
        };
    }

    allocateUsers(bp, count) {
        const config = BP_CONFIG[bp];
        const allocation = [];

        if (config.pool === 'MIXED') {
            // BP008: Split between SUHU and ADMIN (50/50)
            const suhuCount = Math.ceil(count / 2);
            const adminCount = Math.floor(count / 2);
            allocation.push(...this._allocateFromPool('SUHU', suhuCount, bp));
            allocation.push(...this._allocateFromPool('ADMIN', adminCount, bp));
        } else {
            allocation.push(...this._allocateFromPool(config.pool, count, bp));
        }

        return allocation;
    }

    _allocateFromPool(poolName, count, bp) {
        const pool = USER_POOLS[poolName];
        const allocated = [];
        
        for (let userNum = pool.start; userNum <= pool.end && allocated.length < count; userNum++) {
            if (!this.usedUsers[poolName].has(userNum)) {
                this.usedUsers[poolName].add(userNum);
                allocated.push({
                    userNum: userNum,
                    pool: poolName,
                    bp: bp
                });
            }
        }

        if (allocated.length < count) {
            console.warn(`⚠️  ${bp} requested ${count} users from ${poolName}, only ${allocated.length} available`);
        }

        return allocated;
    }

    getStats() {
        return {
            REGULAR: this.usedUsers.REGULAR.size,
            ADMIN: this.usedUsers.ADMIN.size,
            SUHU: this.usedUsers.SUHU.size,
            total: this.usedUsers.REGULAR.size + this.usedUsers.ADMIN.size + this.usedUsers.SUHU.size
        };
    }
}

// ✅ CALCULATE USER DISTRIBUTION
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
    console.log(`   ${bp}: ${userDistribution[bp]} users (${BP_CONFIG[bp].percentage}%) - Pool: ${BP_CONFIG[bp].pool}`);
});
console.log(`   TOTAL: ${TOTAL_USER} users`);

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
        //     { duration: '5m', target: 100 },
        //     { duration: '5m', target: 200 },
        //     { duration: '5m', target: 200 },
        //     { duration: '5m', target: 300 },
        //     { duration: '5m', target: 300 },
        //     { duration: '5m', target: 400 },
        //     { duration: '5m', target: 400 },

            // { duration: '5m', target: 500 },
            // { duration: '5m', target: 500 },
            // { duration: '5m', target: 600 },
            // { duration: '5m', target: 600 },
            // { duration: '5m', target: 700 },
            // { duration: '5m', target: 700 },
            // { duration: '5m', target: 800 },
            // { duration: '5m', target: 800 },

            // { duration: '5m', target: 900 },
            // { duration: '5m', target: 900 },
            // { duration: '5m', target: 1000 },
            // { duration: '5m', target: 1000 },
            // { duration: '5m', target: 1100 },
            // { duration: '5m', target: 1100 },
            // { duration: '5m', target: 1200 },
            // { duration: '5m', target: 1200 },

            // { duration: '5m', target: 1300 },
            // { duration: '5m', target: 1300 },
            // { duration: '5m', target: 1400 },
            // { duration: '5m', target: 1400 },
            // { duration: '5m', target: 1500 },
            // { duration: '5m', target: 1500 },
            // { duration: '5m', target: 1600 },
            // { duration: '5m', target: 1600 },

            // { duration: '5m', target: 1700 },
            // { duration: '5m', target: 1700 },
            // { duration: '5m', target: 1800 },
            // { duration: '5m', target: 1800 },
            // { duration: '5m', target: 1900 },
            // { duration: '5m', target: 1900 },
            // { duration: '5m', target: 2000 },
            // { duration: '5m', target: 2000 },
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

// ✅ GET USER CREDENTIALS - Uses absolute user number
// function getUserCredentials(userNum) {
//     const env = `${__ENV.ENV}`;
//     let email = '';
//     let formattedNum = '';
    
//     if (env === 'DEV' || env === 'QA') {
//         formattedNum = String(userNum).padStart(3, '0');
//         email = 'mostng' + formattedNum + '@guysmail.com';
//     } else if (env === 'DRC') {
//         formattedNum = String(userNum).padStart(3, '0');
//         email = 'MOSTNG' + formattedNum + '@guysmail.com';
//     } else if (env === 'INT') {
//         formattedNum = String(userNum).padStart(2, '0');
//         email = 'TESTMON' + formattedNum + '@guysmail.com';
//     }
    
//     return { email: email, password: 'M@nsek.123' };
// }

function getUserCredentials(userNum, poolType) {
    const env = `${__ENV.ENV}`;
    let email = '';
    let formattedNum = '';
    
    if (env === 'DEV' || env === 'QA') {
        formattedNum = String(userNum).padStart(3, '0');
        if (poolType === 'ADMIN') {
            email = 'admin' + formattedNum + '@guysmail.com';
        } else if (poolType === 'SUHU') {
            email = 'suhu' + formattedNum + '@guysmail.com';
        } else {
            email = 'mostng' + formattedNum + '@guysmail.com';
        }
    } else if (env === 'DRC') {
        formattedNum = String(userNum).padStart(3, '0');
        if (poolType === 'ADMIN') {
            email = 'ADMIN' + formattedNum + '@guysmail.com';
        } else if (poolType === 'SUHU') {
            email = 'SUHU' + formattedNum + '@guysmail.com';
        } else {
            email = 'MOSTNG' + formattedNum + '@guysmail.com';
        }
    } else if (env === 'INT') {
        formattedNum = String(userNum).padStart(2, '0');
        if (poolType === 'ADMIN') {
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        } else if (poolType === 'SUHU') {
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        } else {
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }
    }
    
    return { email: email, password: 'M@nsek.123' };
}

// ✅ LOGIN WITH RETRY - Max 10 attempts
function loginWithRetry(base_url, credentials, vuId, userNum) {
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
                console.log(`   ✅ VU${vuId} (${credentials.email}, User${userNum}) LOGIN SUCCESS on attempt ${attempt}`);
            }
            return {
                success: true,
                token: loginRes.json().data.token,
                attempts: attempt
            };
        }
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(`   ⚠️  VU${vuId} (${credentials.email}, User${userNum}) LOGIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${loginRes.status}, retrying...`);
            sleep(RETRY_DELAY);
        } else {
            console.error(`   ❌ VU${vuId} (${credentials.email}, User${userNum}) LOGIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts - Status: ${loginRes.status}`);
        }
    }
    
    return {
        success: false,
        token: null,
        attempts: MAX_RETRY_ATTEMPTS
    };
}

// ✅ PIN LOGIN WITH RETRY - Max 10 attempts
function pinLoginWithRetry(base_url, token, credentials, vuId, userNum) {
    const pinPayload = JSON.stringify({ value: "123456" });
    const pinHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
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
        const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });
        
        if (pinRes.status === 200) {
            if (attempt > 1) {
                console.log(`   ✅ VU${vuId} (${credentials.email}, User${userNum}) PIN SUCCESS on attempt ${attempt}`);
            }
            return {
                success: true,
                pin_token: pinRes.json().data.pin_token,
                attempts: attempt
            };
        }
        
        if (attempt < MAX_RETRY_ATTEMPTS) {
            console.warn(`   ⚠️  VU${vuId} (${credentials.email}, User${userNum}) PIN attempt ${attempt}/${MAX_RETRY_ATTEMPTS} FAILED - Status: ${pinRes.status}, retrying...`);
            sleep(RETRY_DELAY);
        } else {
            console.error(`   ❌ VU${vuId} (${credentials.email}, User${userNum}) PIN FAILED after ${MAX_RETRY_ATTEMPTS} attempts - Status: ${pinRes.status}`);
        }
    }
    
    return {
        success: false,
        pin_token: null,
        attempts: MAX_RETRY_ATTEMPTS
    };
}

// ✅ SETUP FUNCTION - WITH USER POOL MANAGEMENT AND RETRY LOGIC
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    const poolManager = new UserPoolManager();
    
    const BATCH_SIZE = 100;
    const BATCH_DELAY = 2;
    
    console.log(`🔐 Starting login for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`📦 Batch processing: ${BATCH_SIZE} users per batch, ${BATCH_DELAY}s delay`);
    console.log(`🔁 Retry enabled: Max ${MAX_RETRY_ATTEMPTS} attempts per login/PIN`);
    console.log(`🔑 ALL users will get PIN token`);
    console.log(`\n📊 User Pool Configuration:`);
    console.log(`   Regular: ${USER_POOLS.REGULAR.start}-${USER_POOLS.REGULAR.end}`);
    console.log(`   Admin: ${USER_POOLS.ADMIN.start}-${USER_POOLS.ADMIN.end}`);
    console.log(`   Suhu: ${USER_POOLS.SUHU.start}-${USER_POOLS.SUHU.end}`);
    
    let totalLoginSuccess = 0;
    let totalLoginFailed = 0;
    let totalPinSuccess = 0;
    let totalPinFailed = 0;
    let totalLoginRetries = 0;
    let totalPinRetries = 0;
    
    let globalVuOffset = 1;
    const channelIds = {};
    
    selectedBPs.forEach((bp) => {
        const usersForThisBP = userDistribution[bp];
        
        console.log(`\n📦 Processing ${bp} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        console.log(`   Pool: ${BP_CONFIG[bp].pool}`);
        
        // ✅ ALLOCATE USERS FROM CORRECT POOL
        const allocatedUsers = poolManager.allocateUsers(bp, usersForThisBP);
        
        if (allocatedUsers.length < usersForThisBP) {
            console.error(`   ❌ ${bp} only got ${allocatedUsers.length}/${usersForThisBP} users - POOL EXHAUSTED!`);
        }
        
        // ✅ CREATE VU MAPPING with allocated users
        allocatedUsers.forEach((userAllocation, index) => {
            const vuId = globalVuOffset + index;
            vuMapping[vuId] = {
                bp: bp,
                userNum: userAllocation.userNum,
                pool: userAllocation.pool
            };
        });
        
        // ✅ LOGIN PROCESS IN BATCHES WITH RETRY
        const numBatches = Math.ceil(allocatedUsers.length / BATCH_SIZE);
        
        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchStart = batchNum * BATCH_SIZE;
            const batchEnd = Math.min((batchNum + 1) * BATCH_SIZE, allocatedUsers.length);
            
            console.log(`   📦 Batch ${batchNum + 1}/${numBatches}: Processing ${batchEnd - batchStart} users`);
            
            for (let i = batchStart; i < batchEnd; i++) {
                const userAllocation = allocatedUsers[i];
                // const credentials = getUserCredentials(userAllocation.userNum);
                const credentials = getUserCredentials(userAllocation.userNum, userAllocation.pool);
                const vuId = globalVuOffset + i;
                
                // Step 1: Login with retry
                const loginResult = loginWithRetry(base_url, credentials, vuId, userAllocation.userNum);
                
                if (loginResult.success) {
                    totalLoginSuccess++;
                    if (loginResult.attempts > 1) {
                        totalLoginRetries += (loginResult.attempts - 1);
                    }
                    
                    tokens[vuId] = { 
                        email: credentials.email,
                        userNum: userAllocation.userNum,
                        pool: userAllocation.pool,
                        token: loginResult.token,
                        pin_token: null,
                        bp: bp
                    };
                    
                    // Step 2: PIN Login with retry
                    const pinResult = pinLoginWithRetry(base_url, loginResult.token, credentials, vuId, userAllocation.userNum);
                    
                    if (pinResult.success) {
                        totalPinSuccess++;
                        tokens[vuId].pin_token = pinResult.pin_token;
                        if (pinResult.attempts > 1) {
                            totalPinRetries += (pinResult.attempts - 1);
                        }
                    } else {
                        totalPinFailed++;
                        totalPinRetries += (pinResult.attempts - 1);
                    }
                    
                } else {
                    totalLoginFailed++;
                    totalLoginRetries += (loginResult.attempts - 1);
                    tokens[vuId] = { 
                        email: credentials.email,
                        userNum: userAllocation.userNum,
                        pool: userAllocation.pool,
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
        
        globalVuOffset += allocatedUsers.length;
    });
    
    // ✅ DETAILED SUMMARY
    const poolStats = poolManager.getStats();
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Login: ${totalLoginSuccess}/${TOTAL_USER} success (${((totalLoginSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
    if (totalLoginFailed > 0) console.error(`   ❌ Login Failed: ${totalLoginFailed}`);
    if (totalLoginRetries > 0) console.log(`   🔁 Login Retries: ${totalLoginRetries} total retry attempts`);
    
    console.log(`   ✅ PIN: ${totalPinSuccess}/${TOTAL_USER} success (${((totalPinSuccess/TOTAL_USER)*100).toFixed(1)}%)`);
    if (totalPinFailed > 0) console.error(`   ❌ PIN Failed: ${totalPinFailed}`);
    if (totalPinRetries > 0) console.log(`   🔁 PIN Retries: ${totalPinRetries} total retry attempts`);
    
    console.log(`\n📊 User Pool Usage:`);
    console.log(`   Regular: ${poolStats.REGULAR}/${USER_POOLS.REGULAR.end - USER_POOLS.REGULAR.start + 1} users used`);
    console.log(`   Admin: ${poolStats.ADMIN}/${USER_POOLS.ADMIN.end - USER_POOLS.ADMIN.start + 1} users used`);
    console.log(`   Suhu: ${poolStats.SUHU}/${USER_POOLS.SUHU.end - USER_POOLS.SUHU.start + 1} users used`);
    console.log(`   TOTAL UNIQUE: ${poolStats.total} users allocated`);
    
    console.log(`\n📋 Per-BP Breakdown:`);
    selectedBPs.forEach(bp => {
        const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
        const logins = bpTokens.filter(t => t.token !== null).length;
        const pins = bpTokens.filter(t => t.pin_token !== null).length;
        const pools = [...new Set(bpTokens.map(t => t.pool))].join('+');
        
        if (bpTokens.length > 0) {
            const userNums = bpTokens.map(t => t.userNum).sort((a, b) => a - b);
            const userRange = userNums.length === 1 
                ? `${userNums[0]}`
                : `${userNums[0]}-${userNums[userNums.length - 1]}`;
            
            console.log(`   ${bp}: ${logins}/${bpTokens.length} logins, ${pins} PINs | Pool: ${pools} | Users: ${userRange}`);
        } else {
            console.log(`   ${bp}: 0 users`);
        }
    });
    
    console.log(`\n🎉 Setup completed! All users are UNIQUE across BPs.`);
    console.log(`✅ No user overlap - each BP uses distinct user ranges from their designated pools.`);
    
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
            const htmlPath = `../../../Report/Growin_Community/Web/LoadTest/LoadTest_${runby}_${dateStr}_${timeStr}.html`;
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