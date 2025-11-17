import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP002 - Chat Room
//RUN QA : ../../../k6 run BP002_User.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=75 --out dashboard=export=../../../Report/Growin_Community/BP002/Manual/Manual_DryRun_1103_1631_BP002_Web_User_Local.html
//RUN INT: ../../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e USER=58 -e DURATION=10m -e NUMSTART=101 --out dashboard=export=../../../Report/Growin_Community/BP002/Manual/Manual_DryRun_1023_1656_BP002_Web_User_Local.html
//RUN STRESS TEST: ../../../k6 run BP002.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP002/Manual/Manual_DryRun_2021_1128_BP002_Web_User_Local.html
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

// /socialinvesting/api/v1/channel/joined-by-user
// https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/read?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq
// https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/pinned_messages?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22limit%22%3A1%2C%22sort%22%3A%5B%7B%22field%22%3A%22pinned_at%22%2C%22direction%22%3A-1%7D%5D%7D
// https://chat.stream-io-api.com/members?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22type%22%3A%22messaging%22%2C%22id%22%3A%22f3dbab75-573d-49d2-a573-78b244d39b8a%22%2C%22sort%22%3A%5B%5D%2C%22filter_conditions%22%3A%7B%22name%22%3A%7B%22%24autocomplete%22%3A%22prim%22%7D%7D%7D"

// Socialinvesting_Channel_JoinedByUser
// ChatStreamIoApi_Channels_Messaging_1
// ChatStreamIoApi_Channels_Messaging_2
// ChatStreamIoApi_Members

// Define custom metrics
const ChatRoom = {
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_002_01_01_Socialinvesting_Channel_JoinedByUser"),
    },
    ChatStreamIoApi_Channels_Messaging_1: {
        errorCount: new Counter("error_count_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        errorRate: new Rate("error_rate_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpDuration: new Trend("duration_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpWaiting: new Trend("waiting_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        requestRate: new Counter("rps_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        http_reqs: new Counter("sample_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
    },
    ChatStreamIoApi_Channels_Messaging_2: {
        errorCount: new Counter("error_count_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        errorRate: new Rate("error_rate_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpDuration: new Trend("duration_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpWaiting: new Trend("waiting_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        requestRate: new Counter("rps_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        http_reqs: new Counter("sample_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
    },
    ChatStreamIoApi_Members: {
        errorCount: new Counter("error_count_004_01_04_ChatStreamIoApi_Members"),
        errorRate: new Rate("error_rate_004_01_04_ChatStreamIoApi_Members"),
        httpDuration: new Trend("duration_004_01_04_ChatStreamIoApi_Members"),
        httpWaiting: new Trend("waiting_004_01_04_ChatStreamIoApi_Members"),
        requestRate: new Counter("rps_004_01_04_ChatStreamIoApi_Members"),
        http_reqs: new Counter("sample_004_01_04_ChatStreamIoApi_Members"),
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
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
            // `https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/read?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq`,
            // `https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/pinned_messages?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22limit%22%3A1%2C%22sort%22%3A%5B%7B%22field%22%3A%22pinned_at%22%2C%22direction%22%3A-1%7D%5D%7D`,
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
            ['GET', urls[0], null, { headers: stepOneHeaders }],
            // ['GET', urls[1], null, { headers: stepOneHeaders }],
            // ['GET', urls[2], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                ChatRoom.Socialinvesting_Channel_JoinedByUser,
                // ChatRoom.ChatStreamIoApi_Channels_Messaging_1,
                // ChatRoom.ChatStreamIoApi_Channels_Messaging_2,
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

    // // Batch 2
    // if (token) {
    //     const urls = [
    //         `https://chat.stream-io-api.com/members?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22type%22%3A%22messaging%22%2C%22id%22%3A%22f3dbab75-573d-49d2-a573-78b244d39b8a%22%2C%22sort%22%3A%5B%5D%2C%22filter_conditions%22%3A%7B%22name%22%3A%7B%22%24autocomplete%22%3A%22prim%22%7D%7D%7D"`
    //     ];

    //     const stepTwoHeaders = {
    //         // 'Cookie': `ACCESS_TOKEN=${token}`,
    //         // 'Content-Type': 'application/json',

    //         'Cookie': `ACCESS_TOKEN=${token}`,
    //         'Content-Type': 'application/json',
    //         'Accept-Language':'en',
    //         'Connection':'keep-alive',
    //         'Accept-Encoding':'gzip, deflate, br',
    //         'Accept':'*/*',
    //     };

    //     const requests = [
    //         ['GET', urls[0], null, { headers: stepTwoHeaders }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             ChatRoom.ChatStreamIoApi_Members,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
    //             }
    //         }
    //     });
    // }
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
            const htmlPath = `../../../Report/Growin_Community/BP002/Manual/${__ENV.RUNBY}_Detail_BP002_Web_User_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP002/Regression/${__ENV.RUNBY}_Detail_BP002_Web_User_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP002/LoadTest/${__ENV.RUNBY}_Detail_BP002_Web_User_${dateStr}_${timeStr}.html`;
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