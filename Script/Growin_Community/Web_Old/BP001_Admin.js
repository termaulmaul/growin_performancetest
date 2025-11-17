import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP001 - Your Communities
//RUN QA : ../../../k6 run BP001_Admin.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=98 --out dashboard=export=../../../Report/Growin_Community/BP001/Manual/Manual_DryRun_1103_1556_BP001_Web_Admin_Local.html
//RUN INT: ../../../k6 run BP001_Admin.js -e RUNBY=Manual -e ENV=INT -e USER=58 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/BP001/Manual/Manual_DryRun_1023_1656_BP001_Web_Admin_Local.html
//RUN STRESS TEST: ../../../k6 run BP001_Admin.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP001/Manual/Manual_DryRun_2021_1128_BP001_Web_Admin_Local.html
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

// /socialinvesting/api/v2/community-profile/login
// /socialinvesting/api/v1/channel/joined-by-user
// /socialinvesting/api/v1/community-profile/get-profile
// /socialinvesting/api/v1/channel/get-list
// https://chat.stream-io-api.com/channels
// wss://chat.stream-io-api.com/connect?json=%7B%22user_id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22user_details%22%3A%7B%22id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22image%22%3A%22%22%7D%2C%22client_request_id%22%3A%22d737b9de-8e5f-44ff-9aa0-fbad45787d55%22%7D&api_key=nnp9r257yfpq&authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzI2MjJkMjctOGQ3Yy00YTk2LWIyZGUtOWVjY2VmY2NlOWNlIn0.gruehExQyq23gJZh9bn9yKwqbNwe2wD7RgjOluBAGx0&stream-auth-type=jwt&X-Stream-Client=stream-chat-js-v8.60.0-browser

// Socialinvesting_CommunityProfile_Login
// Socialinvesting_Channel_JoinedByUser
// Socialinvesting_CommunityProfile_GetProfile
// Socialinvesting_Channel_GetList
// ChatStreamIoApi_Channels
// ChatStreamIoApi_Connect

// Define custom metrics
const YourCommunities = {
    Socialinvesting_CommunityProfile_Login: {
        errorCount: new Counter("error_count_001_01_01_Socialinvesting_CommunityProfile_Login"),
        errorRate: new Rate("error_rate_001_01_01_Socialinvesting_CommunityProfile_Login"),
        httpDuration: new Trend("duration_001_01_01_Socialinvesting_CommunityProfile_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Socialinvesting_CommunityProfile_Login"),
        requestRate: new Counter("rps_001_01_01_Socialinvesting_CommunityProfile_Login"),
        http_reqs: new Counter("sample_001_01_01_Socialinvesting_CommunityProfile_Login"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_001_01_02_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_GetList: {
        errorCount: new Counter("error_count_001_02_04_Socialinvesting_Channel_GetList"),
        errorRate: new Rate("error_rate_001_02_04_Socialinvesting_Channel_GetList"),
        httpDuration: new Trend("duration_001_02_04_Socialinvesting_Channel_GetList"),
        httpWaiting: new Trend("waiting_001_02_04_Socialinvesting_Channel_GetList"),
        requestRate: new Counter("rps_001_02_04_Socialinvesting_Channel_GetList"),
        http_reqs: new Counter("sample_001_02_04_Socialinvesting_Channel_GetList"),
    },
    ChatStreamIoApi_Channels: {
        errorCount: new Counter("error_count_001_02_05_ChatStreamIoApi_Channels"),
        errorRate: new Rate("error_rate_001_02_05_ChatStreamIoApi_Channels"),
        httpDuration: new Trend("duration_001_02_05_ChatStreamIoApi_Channels"),
        httpWaiting: new Trend("waiting_001_02_05_ChatStreamIoApi_Channels"),
        requestRate: new Counter("rps_001_02_05_ChatStreamIoApi_Channels"),
        http_reqs: new Counter("sample_001_02_05_ChatStreamIoApi_Channels"),
    },
    ChatStreamIoApi_Connect: {
        errorCount: new Counter("error_count_001_02_06_ChatStreamIoApi_Connect"),
        errorRate: new Rate("error_rate_001_02_06_ChatStreamIoApi_Connect"),
        httpDuration: new Trend("duration_001_02_06_ChatStreamIoApi_Connect"),
        httpWaiting: new Trend("waiting_001_02_06_ChatStreamIoApi_Connect"),
        requestRate: new Counter("rps_001_02_06_ChatStreamIoApi_Connect"),
        http_reqs: new Counter("sample_001_02_06_ChatStreamIoApi_Connect"),
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

// MAIN TEST FUNCTION - Runs for each iteration
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

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v2/community-profile/login`,
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

        const requests = [
            ['POST', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                YourCommunities.Socialinvesting_CommunityProfile_Login,
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

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/get-list`,
            // `https://chat.stream-io-api.com/channels?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq`,
            // `wss://chat.stream-io-api.com/connect?json=%7B%22user_id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22user_details%22%3A%7B%22id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22image%22%3A%22%22%7D%2C%22client_request_id%22%3A%22d737b9de-8e5f-44ff-9aa0-fbad45787d55%22%7D&api_key=nnp9r257yfpq&authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzI2MjJkMjctOGQ3Yy00YTk2LWIyZGUtOWVjY2VmY2NlOWNlIn0.gruehExQyq23gJZh9bn9yKwqbNwe2wD7RgjOluBAGx0&stream-auth-type=jwt&X-Stream-Client=stream-chat-js-v8.60.0-browser`,
        ];

        const stepTwoHeaders = {
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
            ['GET', urls[0], null, { headers: stepTwoHeaders }],
            ['GET', urls[1], null, { headers: stepTwoHeaders }],
            ['GET', urls[2], null, { headers: stepTwoHeaders }],
            // ['GET', urls[3], null, { headers: stepTwoHeaders }],
            // ['GET', urls[4], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                YourCommunities.Socialinvesting_Channel_JoinedByUser,
                YourCommunities.Socialinvesting_CommunityProfile_GetProfile,
                YourCommunities.Socialinvesting_Channel_GetList,
                // YourCommunities.ChatStreamIoApi_Channels,
                // YourCommunities.ChatStreamIoApi_Connect,
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
            const htmlPath = `../../../Report/Growin_Community/BP001/Manual/${__ENV.RUNBY}_Detail_BP001_Web_Admin_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP001/Regression/${__ENV.RUNBY}_Detail_BP001_Web_Admin_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP001/LoadTest/${__ENV.RUNBY}_Detail_BP001_Web_Admin_${dateStr}_${timeStr}.html`;
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