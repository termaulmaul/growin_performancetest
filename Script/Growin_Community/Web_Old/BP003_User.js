import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP003 - Stock Pick
//RUN QA : ../../../k6 run BP003_User.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=75 --out dashboard=export=../../../Report/Growin_Community/BP003/Manual/Manual_DryRun_1103_1639_BP003_Web_User_Local.html
//RUN INT: ../../../k6 run BP003_User.js -e RUNBY=Manual -e ENV=INT -e USER=58 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/BP003/Manual/Manual_DryRun_1023_1656_BP003_Web_User_Local.html
//RUN STRESS TEST: ../../../k6 run BP003_User.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP003/Manual/Manual_DryRun_2021_1128_BP003_Web_User_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// Define options for test execution
// export const options = {
//     scenarios: {
//         contacts: {
//             executor: 'constant-vus',
//             vus: `${__ENV.USER}`,
//             duration: `${__ENV.DURATION}`,
//             gracefulStop: '30s',
//         },
//     },
//     noConnectionReuse: false,
//     setupTimeout: '120m',
//     teardownTimeout: '120m',
//     summaryTimeUnit: '120m',
// };

export const options = {
    scenarios: {
        contacts: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '1h',
        },
    },
};

// /socialinvesting/api/v1/stock-pick?channel_id=f3dbab75-573d-49d2-a573-78b244d39b8a&page=1&limit=10
// /search/query-social-investing

// Socialinvesting_StockPick
// Search_QuerySocialInvesting

// Define custom metrics
const StockPick = {
    Socialinvesting_StockPick: {
        errorCount: new Counter("error_count_003_01_01_Socialinvesting_StockPick"),
        errorRate: new Rate("error_rate_0003_01_01_Socialinvesting_StockPick"),
        httpDuration: new Trend("duration_0003_01_01_Socialinvesting_StockPick"),
        httpWaiting: new Trend("waiting_0003_01_01_Socialinvesting_StockPick"),
        requestRate: new Counter("rps_0003_01_01_Socialinvesting_StockPick"),
        http_reqs: new Counter("sample_0003_01_01_Socialinvesting_StockPick"),
    },
    Search_QuerySocialInvesting: {
        errorCount: new Counter("error_count_003_01_02_Search_QuerySocialInvesting"),
        errorRate: new Rate("error_rate_0003_01_02_Search_QuerySocialInvesting"),
        httpDuration: new Trend("duration_0003_01_02_Search_QuerySocialInvesting"),
        httpWaiting: new Trend("waiting_0003_01_02_Search_QuerySocialInvesting"),
        requestRate: new Counter("rps_0003_01_02_Search_QuerySocialInvesting"),
        http_reqs: new Counter("sample_0003_01_02_Search_QuerySocialInvesting"),
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
    const channelIds = {};  // ✅ Store channel_id for each user
    
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
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
            'User-Agent':'PostmanRuntime/7.43.0'
        };

        const res = http.post(base_url + '/auth/api/v1/login', payload, { headers: headers });

        if (res.status === 200) {
            const token = res.json().data.token;
            tokens[i] = { email: email, token: token };
            console.log(`User ${i}/${totalUsers} - ${email} Login Success`);
            
            // ✅ GET channel_id after successful login
            const channelHeaders = {
                'Cookie': `ACCESS_TOKEN=${token}`,
                'Content-Type': 'application/json',
                'Accept-Language':'en',
                'Connection':'keep-alive',
                'Accept-Encoding':'gzip, deflate, br',
                'Accept':'*/*',
            };
            
            const channelRes = http.get(
                base_url + '/socialinvesting/api/v1/channel/joined-by-user',
                { headers: channelHeaders }
            );
            
            if (channelRes.status === 200) {
                try {
                    const channelData = channelRes.json();
                    if (channelData.data && channelData.data.length > 0) {
                        const channelId = channelData.data[0].channel_id;
                        channelIds[i] = channelId;
                        console.log(`User ${i}/${totalUsers} - ${email} Channel ID: ${channelId}`);
                    } else {
                        console.warn(`User ${i}/${totalUsers} - ${email} No channels found`);
                        channelIds[i] = null;
                    }
                } catch (e) {
                    console.error(`User ${i}/${totalUsers} - ${email} Failed to parse channel data: ${e.message}`);
                    channelIds[i] = null;
                }
            } else {
                console.error(`User ${i}/${totalUsers} - ${email} Failed to get channel - Status: ${channelRes.status}`);
                channelIds[i] = null;
            }
            
        } else {
            console.error(`User ${i}/${totalUsers} - ${email} Login Failed - Status: ${res.status}`);
            tokens[i] = { email: email, token: null };
            channelIds[i] = null;
        }
    }
    
    console.log(`Login phase completed for ${totalUsers} users`);
    
    return { 
        base_url: base_url, 
        tokens: tokens,
        channelIds: channelIds  // ✅ Return channel IDs
    };
}

// MAIN TEST FUNCTION
export default function (data) {
    // Get token and channel_id for this VU
    const vuId = exec.vu.idInTest;
    const userToken = data.tokens[vuId];
    const channelId = data.channelIds[vuId];
    
    if (!userToken || !userToken.token) {
        console.error(`VU${vuId} - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;
    const base_url = data.base_url;

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/stock-pick?channel_id=${channelId}&page=1&limit=10`,
        ]

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

        const requests = [
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockPick.Socialinvesting_StockPick,
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
    
    // Batch 4
    if (token) {
        const urls = [
            base_url + `/search/query-social-investing`,
        ];

        const stepFourHeaders = {
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
            ['GET', urls[0], null, { headers: stepFourHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockPick.Search_QuerySocialInvesting,
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
            const htmlPath = `../../../Report/Growin_Community/BP003/Manual/${__ENV.RUNBY}_Detail_BP003_Web_User_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP003/Regression/${__ENV.RUNBY}_Detail_BP003_Web_User_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP003/LoadTest/${__ENV.RUNBY}_Detail_BP003_Web_User_${dateStr}_${timeStr}.html`;
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