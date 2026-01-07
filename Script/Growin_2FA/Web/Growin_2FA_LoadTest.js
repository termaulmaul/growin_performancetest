// Command
// Run Multiple BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=LoadTest -e ENV=INT -e USER=316 -e DURATION=2h -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_2FA/Web/LoadTest/Manual_LoadTest_1120_2220.html

// Run Single BP
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP001 --out dashboard=export=../../../Report/Growin_2FA/Web/BP001/Manual/Manual_DryRun_0106_1545_BP001_Local.html
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=2000 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP002 --out dashboard=export=../../../Report/Growin_2FA/Web/BP002/Manual/Manual_DryRun_0107_1231_BP002_Local.html
// ../../../k6 run Growin_2FA_LoadTest.js -e RUNBY=Manual -e ENV=INT -e USER=300 -e DURATION=5m -e NUMSTART=101 -e SCENARIO=BP003 --out dashboard=export=../../../Report/Growin_2FA/Web/BP003/Manual/Manual_DryRun_0107_1616_BP003_Local.html

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
    BP002: 100,
    BP003: 100,
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
        executor: 'constant-vus',
        vus: userDistribution[bp] || 1,
        duration: `${__ENV.DURATION}`,
        gracefulStop: '30s',

        // executor: 'per-vu-iterations',
        // vus: 10,
        // iterations: 10,
        // maxDuration: '1h',

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

// ✅ SETUP FUNCTION - BP001 hanya simpan email, BP lain dapat token + PIN
export function setup() {
    const base_url = getBaseUrl();
    const tokens = {};
    const vuMapping = {};
    
    console.log(`🔐 Starting setup for ${TOTAL_USER} users distributed across ${selectedBPs.length} BPs...`);
    console.log(`⚠️  ALL BPs will SKIP login/PIN - email only mode`);
    
    let globalUserOffset = 0;
    let globalVuOffset = 1;
    
    const channelIds = {};
    
    selectedBPs.forEach((bp, bpIndex) => {
        const usersForThisBP = userDistribution[bp];
        
        console.log(`\n📦 Processing ${bp} - ${usersForThisBP} users (VU ${globalVuOffset} to ${globalVuOffset + usersForThisBP - 1})...`);
        console.log(`   ⏭️  SKIPPING authentication - email only mode`);
        
        // Create VU mapping
        for (let localUserIndex = 1; localUserIndex <= usersForThisBP; localUserIndex++) {
            const vuId = globalVuOffset + localUserIndex - 1;
            vuMapping[vuId] = {
                bp: bp,
                userKey: globalUserOffset + localUserIndex
            };
            
            const credentials = getUserCredentials(localUserIndex, globalUserOffset);
            const userKey = globalUserOffset + localUserIndex;
            
            // Simpan hanya email, token null
            tokens[userKey] = { 
                email: credentials.email, 
                token: null,
                pin_token: null,
                bp: bp
            };
        }
        
        globalUserOffset += usersForThisBP;
        globalVuOffset += usersForThisBP;
    });
    
    console.log(`\n📊 Setup Summary:`);
    console.log(`   ⏭️  Total users with email only: ${TOTAL_USER}/${TOTAL_USER}`);
    
    console.log(`\n📋 Per-BP Summary:`);
    selectedBPs.forEach(bp => {
        const bpTokens = Object.values(tokens).filter(t => t.bp === bp);
        const channelId = channelIds[bp] || 'N/A';
        console.log(`   ${bp}: ${bpTokens.length} email-only users (no auth), channel_id: ${channelId}`);
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
            const htmlPath = `../../../Report/Growin_2FA/Web/LoadTest/${runby}_${dateStr}_${timeStr}.html`;
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