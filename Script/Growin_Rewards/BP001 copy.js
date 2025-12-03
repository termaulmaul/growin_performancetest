import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP001 - Login
//RUN QA : ../../k6 run BP001.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=98 --out dashboard=export=../../Report/Growin_Rewards/BP001/Manual/Manual_DryRun_1027_1420_BP001_Local.html
//RUN INT: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=1m -e NUMSTART=101 --out dashboard=export=../../Report/Growin_Rewards/BP001/Manual/Manual_DryRun_1111_2107_BP001_Local.html
//RUN STRESS TEST: ../../k6 run BP001.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/Growin_Rewards/BP001/Manual/Manual_DryRun_2021_1128_BP001_Local.html
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

// /auth/api/v1/login?nocookie=1
// /gamification/api/v2/user/detail

// Auth_Login
// Gamification_User_Detail

// Define custom metrics
const Login = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    Gamification_User_Detail: {
        errorCount: new Counter("error_count_001_01_02_Gamification_User_Detail"),
        errorRate: new Rate("error_rate_001_01_02_Gamification_User_Detail"),
        httpDuration: new Trend("duration_001_01_02_Gamification_User_Detail"),
        httpWaiting: new Trend("waiting_001_01_02_Gamification_User_Detail"),
        requestRate: new Counter("rps_001_01_02_Gamification_User_Detail"),
        http_reqs: new Counter("sample_001_01_02_Gamification_User_Detail"),
    },
};

// SETUP FUNCTION - Hanya untuk prepare data
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    // Determine base_url
    if(`${__ENV.ENV}`=='DEV'){
        base_url = 'https://api-dev.growin.id';
    } else if ((`${__ENV.ENV}`=='QA')) {
        base_url = 'https://api-qa.growin.id';
    } else if (`${__ENV.ENV}`=='DRC') {
        base_url = 'https://drc-api.growin.id';
    } else if (`${__ENV.ENV}`=='INT') {
        base_url = 'https://internal-api-pt.growin.id';
    }

    // Prepare user emails (tidak login di setup)
    const users = {};
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
        console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
        users[i] = { email: email };
    }
    
    console.log(`Prepared ${totalUsers} users for login testing`);
    
    return { base_url: base_url, users: users };
}

// MAIN TEST FUNCTION - Runs for each iteration
export default function (data) {
    const vuId = exec.vu.idInTest;
    const user = data.users[vuId];
    const base_url = data.base_url;
    const email = user.email;

    // Batch 1
    let token;
    const loginUrl = base_url + `/auth/api/v1/login`;

    const authLoginPayload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    const loginHeaders = {
        // 'Content-Type': 'application/json',

        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    // Perform login request
    const loginResponse = http.post(loginUrl, authLoginPayload, { headers: loginHeaders });

    // Process Login metrics
    const loginMetric = Login.Auth_Login;
    loginMetric.httpDuration.add(loginResponse.timings.duration);
    
    if (loginResponse.status === 200) {
        loginMetric.errorRate.add(false);
        loginMetric.errorCount.add(0);
        loginMetric.requestRate.add(true);
        loginMetric.http_reqs.add(1);
        
        // Extract token from response
        try {
            token = loginResponse.json().data.token;
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`VU${vuId} ${email} Login SUCCESS || Status: ${loginResponse.status}`);
            }
        } catch (e) {
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`VU${vuId} ${email} Failed to parse token || Error: ${e.message}`);
            }
        }
    } else {
        loginMetric.errorRate.add(true);
        loginMetric.errorCount.add(1);
        loginMetric.requestRate.add(false);
        loginMetric.http_reqs.add(1);
        check(loginResponse, {
            [`ERROR ${loginUrl} || Status: ${loginResponse.status} || Body: ${loginResponse.body}`]: (r) => r.status === 200
        });
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`VU${vuId} ${email} Login ERROR || Status: ${loginResponse.status} || Response: ${loginResponse.body}`);
        }
    }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/gamification/api/v2/user/detail`,
        ];

        const batchHeaders = {

            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login.Gamification_User_Detail,
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
            const htmlPath = `../../Report/Growin_Rewards/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../Report/Growin_Rewards/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_${dateStr}_${timeStr}.html`;
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