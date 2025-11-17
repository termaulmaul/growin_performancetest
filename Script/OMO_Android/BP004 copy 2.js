import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../Helper/bundle.js';
import { textSummary } from "../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP004 - Profile Confirmation Page
//RUN QA : ../../k6 run BP004.js -e RUNBY=Manual -e ENV=QA -e USER=70 -e DURATION=1m -e NUMSTART=93 --out dashboard=export=../../Report/OMO_Android/BP004/Manual/Manual_DryRun_1028_2202_BP004_Local.html
//RUN INT: ../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e USER=70 -e DURATION=15m -e NUMSTART=101 --out dashboard=export=../../Report/OMO_Android/BP004/Manual/Manual_DryRun_1029_1225_BP004_Local.html
//RUN STRESS TEST: ../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../Report/OMO_Android/BP004/Manual/Manual_DryRun_2021_1128_BP004_Local.html
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
    setupTimeout: '120m',
    teardownTimeout: '120m',
    summaryTimeUnit: '120m',
};

// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'ramping-vus',
//             startVUs: 0,
//             stages: [
//                 { duration: '30s', target: parseInt(`${__ENV.USER}`) || 10 },  // ✅ Ramp-up 30s
//                 { duration: `${__ENV.DURATION}`, target: parseInt(`${__ENV.USER}`)},  // ✅ Hold
//                 { duration: '30s', target: 0 },  // ✅ Ramp-down 30s
//             ],
//             gracefulRampDown: '30s',
//             gracefulStop: '30s',
//         },
//     },
//     noConnectionReuse: false,
//     setupTimeout: '120m',
//     teardownTimeout: '120m',
//     summaryTimeUnit: '120m',
// };

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

// /user/api/v1/profile/identity/regular
// /oaofinance/api/v1/margin/draft

// User_Profile_Identity_Regular
// Oaofinance_Margin_Draft

// Define custom metrics
const ProfileConfirmationPage = {
    User_Profile_Identity_Regular: {
        errorCount: new Counter("error_count_004_01_01_User_Profile_Identity_Regular"),
        errorRate: new Rate("error_rate_004_01_01_User_Profile_Identity_Regular"),
        httpDuration: new Trend("duration_004_01_01_User_Profile_Identity_Regular"),
        httpWaiting: new Trend("waiting_004_01_01_User_Profile_Identity_Regular"),
        requestRate: new Counter("rps_004_01_01_User_Profile_Identity_Regular"),
        http_reqs: new Counter("sample_004_01_01_User_Profile_Identity_Regular"),
    },
    Oaofinance_Margin_Draft: {
        errorCount: new Counter("error_count_004_01_02_Oaofinance_Margin_Draft"),
        errorRate: new Rate("error_rate_004_01_02_Oaofinance_Margin_Draft"),
        httpDuration: new Trend("duration_004_01_02_Oaofinance_Margin_Draft"),
        httpWaiting: new Trend("waiting_004_01_02_Oaofinance_Margin_Draft"),
        requestRate: new Counter("rps_004_01_02_Oaofinance_Margin_Draft"),
        http_reqs: new Counter("sample_004_01_02_Oaofinance_Margin_Draft"),
    },
};

// SETUP FUNCTION - Runs once before test starts
export function setup() {
    let base_url = '';
    const totalUsers = parseInt(`${__ENV.USER}`) || 1;
    const startNum = parseInt(`${__ENV.NUMSTART}`) || 0;
    
    // Determine base_url
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
    
    console.log(`Starting login for ${totalUsers} users...`);
    
    // Login untuk semua user sekaligus di setup phase
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

        const payload = JSON.stringify({
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
            'User-Agent':'PostmanRuntime/7.43.0'
        };

        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

        // if (res.status === 200) {
        //     const responseData = res.json();
        //     const token = responseData.data.token;
        //     // const userid = responseData.data.userid;

        //     const userid = responseData.data.userid;
        //     tokens[i] = { email: email, token: token, userid: userid };
        //     console.log(`User ${i}/${totalUsers} - ${email} Login Success - Body: ${res.body.data.userid}`);
        //     // console.log(`User ${i}/${totalUsers} - ${email} (ID: ${userid}) Login Success`);
        //     // console.log(`${email} - ${userid}`);
        // } else {
        //     console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
        //     tokens[i] = { email: email, token: null };
        // }
        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
            tokens[i] = { email: email, token: null };
        }
    }
    
    console.log(`Login phase completed for ${totalUsers} users`);
    
    return { base_url: base_url, tokens: tokens };
}

// Main test function
export default function (data) {
    // Get token for this VU
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const base_url = data.base_url;
    
    // if (token) {
    //     const validateUrl = base_url + '/auth/api/v1/access/validate-parse?typ=ACCESS';
        
    //     const validateHeaders = {
    //         'Authorization': `Bearer ${token}`,  // ✅ Sesuai curl
    //     };

    //     const validateResponse = http.get(validateUrl, { headers: validateHeaders });

    //     // Process metrics for validate-parse
        
    //     if (validateResponse.status === 200) {
    //         if (`${__ENV.ENV}` != 'INT') {
    //             console.log(`${email} ${validateUrl} || Status: ${validateResponse.status} || Body: ${validateResponse.body}`);
    //         }
    //     } else {
    //         if (`${__ENV.ENV}` != 'INT') {
    //             console.error(`VU${vuId} ${email} Token Validation FAILED || Status: ${validateResponse.status}`);
    //         }
    //         return; // Stop jika validasi gagal
    //     }
    // }

    // 1 //
    if (token) {
        const urls = [
            base_url + `/user/api/v1/profile/identity/regular`,
            base_url + `/oaofinance/api/v1/margin/draft`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const OaofinanceMarginPayload = JSON.stringify({
            is_consent_margin: true, 
            is_consent_lpip: true
        });

        const requests = [
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
            ['POST', urls[1], OaofinanceMarginPayload, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                ProfileConfirmationPage.User_Profile_Identity_Regular,
                ProfileConfirmationPage.Oaofinance_Margin_Draft,
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
    sleep(0,25);
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
            const htmlPath = `../../Report/OMO_Android/BP004/Manual/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../Report/OMO_Android/BP004/Regression/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../Report/OMO_Android/BP004/LoadTest/${__ENV.RUNBY}_Detail_BP004_${dateStr}_${timeStr}.html`;
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