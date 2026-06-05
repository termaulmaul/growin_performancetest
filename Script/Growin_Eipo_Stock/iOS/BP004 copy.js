import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP004 - e-IPO Agreement  Screen
//RUN QA : ../../../k6 run BP004.js -e RUNBY=Manual -e ENV=QA -e USER=10 -e DURATION=1m -e NUMSTART=98 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_1029_1343_BP004.html
//RUN INT: ../../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_1031_1546_BP004.html
//RUN STRESS TEST: ../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/Manual_DryRun_2021_1128_BP004.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// Define options for test execution
export const options = {
    scenarios: {
        contacts: {
            executor: 'constant-vus',
            vus: `${__ENV.USER}`,
            duration: `${__ENV.DURATION}`,
            gracefulStop: '30s',
        },
    },
    noConnectionReuse: false,
    setupTimeout: '3600s',
    teardownTimeout: '3600s',
    summaryTimeUnit: '3600s',
};

// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'per-vu-iterations',
//             vus: 1,
//             iterations: 1,
//             maxDuration: '1h',
//         },
//     },
// };

// /eipo/investor

// Eipo_Investor

// Define custom metrics
const AgreementScreen = {
    Eipo_Investor: {
        errorCount: new Counter("error_count_004_01_01_Eipo_Investor"),
        errorRate: new Rate("error_rate_004_01_01_Eipo_Investor"),
        httpDuration: new Trend("duration_004_01_01_Eipo_Investor"),
        httpWaiting: new Trend("waiting_004_01_01_Eipo_Investor"),
        requestRate: new Counter("rps_004_01_01_Eipo_Investor"),
        http_reqs: new Counter("sample_004_01_01_Eipo_Investor"),
    },
};

// SETUP FUNCTION - Runs once before test starts
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://dev-api.growin.id';
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id';
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id';
    }

    const tokens = {};
    
    console.log(`Starting login and PIN login for ${totalUsers} users...`);
    
    for (let i = 1; i <= totalUsers; i++) {
        let email = '';
        let formattedNum = '';
        
        if(`${__ENV.ENV}`=='DEV' || `${__ENV.ENV}`=='QA'){
            formattedNum = String(startNum + i - 1).padStart(3, '0');
            email = 'mostng' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='DRC') {
            formattedNum = String(startNum + i - 1).padStart(0, '0');
            email = 'MOSTNG' + formattedNum + '@guysmail.com';
        } else if (`${__ENV.ENV}`=='INT') {
            formattedNum = String(startNum + i - 1).padStart(2, '0');
            email = 'TESTMON' + formattedNum + '@guysmail.com';
        }

        const loginPayload = JSON.stringify({
            password: 'M@nsek.123',
            email: email,
            recaptcha: '',
        });

        const headers = {
            // 'Content-Type': 'application/json',
            
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        let res = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: headers });

        let token = null;
        let pin_token = null;

        if (res.status === 200) {
            token = res.json().data.token;
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);

            const pinPayload = JSON.stringify({ value: "123456" });
            const pinHeaders = { 
                // 'Cookie': `ACCESS_TOKEN=${token}`
                // 'Content-Type': 'application/json', 

                'Cookie': `ACCESS_TOKEN=${token}` ,
                'Content-Type': 'application/json',
                'Accept-Language':'en',
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            };

            res = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

            if (res.status === 200) {
                pin_token = res.json().data.pin_token;
                console.log(`User ${i}/${totalUsers} - ${email} PIN Login Success`);
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} PIN Login Failed - Status: ${res.status}`);
            }
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
        }

        tokens[i] = { 
            email: email, 
            token: token,
            pin_token: pin_token
        };
    }
    
    console.log(`Login and PIN login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

export default function (data) {
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`VU${vuId} - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const base_url = data.base_url;

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/eipo/api/v1/cash-limit`,
            base_url + `/eipo/order`,
            base_url + `/eipo/pipeline/EMSM`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                AgreementScreen.Eipo_Investor,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.25);
}

// ✅ OPTIMIZED handleSummary
export function handleSummary(data) {
    try {
        // ✅ Handle missing metrics
        if (!data.metrics.data_received) {
            data.metrics.data_received = { values: { count: 0, rate: 0 } };
        }
        if (!data.metrics.data_sent) {
            data.metrics.data_sent = { values: { count: 0, rate: 0 } };
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '');
        const timeStr = now.toLocaleTimeString('id-ID').replace(/:/g, '');
        
        console.log(`[${dateStr}_${timeStr}] Starting report generation...`);
        
        if(`${__ENV.RUNBY}`=='Manual'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/BP004/Manual/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/BP004/Regression/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Eipo_Stock/iOS/BP004/LoadTest/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        }
        
    } catch (error) {
        console.error(`❌ handleSummary error: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        
        // ✅ Fallback: text only
        return {
            'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        };
    }
}