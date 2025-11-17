import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { htmlReport } from '../../../Helper/bundle.js';
import { textSummary } from "../../../Helper/textSummary.js";
import { SharedArray } from 'k6/data';

// ##READ ME
//BP004 - Stock Pick Suhu
//RUN QA : ../../../k6 run BP004.js -e RUNBY=Manual -e ENV=QA -e USER=1 -e DURATION=1m -e NUMSTART=75 --out dashboard=export=../../../Report/Growin_Community/BP004/Manual/Manual_DryRun_1111_1029_BP004_Web_Local.html
//RUN INT: ../../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e USER=1 -e DURATION=10m -e NUMSTART=1 --out dashboard=export=../../../Report/Growin_Community/BP004/Manual/Manual_DryRun_1113_2123_BP004_Web_Local.html
//RUN STRESS TEST: ../../../k6 run BP004.js -e RUNBY=Manual -e ENV=INT -e NUMSTART=0 --out dashboard=export=../../../Report/Growin_Community/BP004/Manual/Manual_DryRun_2021_1128_BP004_Web_Local.html
// ITER - type of int, many iteration each vUser
// USER - type of int, many of vUser
// NUMSTART - set user starting number example : if 0 the user will be MOSTNG1@guysmail.com
// ENV options [DEV,QA,IR,DRC,INT]

// // Define options for test execution
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
// /socialinvesting/api/v1/create-stock-pick
// /socialinvesting/api/v1/stock-pick?id={id}
// /search/query-social-investing

// Socialinvesting_StockPick
// Socialinvesting_CreateStockPick
// Socialinvesting_StockPickID
// Search_QuerySocialInvesting

// Define custom metrics
const StockPick = {
    Socialinvesting_StockPick: {
        errorCount: new Counter("error_count_003_01_01_Socialinvesting_StockPick"),
        errorRate: new Rate("error_rate_003_01_01_Socialinvesting_StockPick"),
        httpDuration: new Trend("duration_003_01_01_Socialinvesting_StockPick"),
        httpWaiting: new Trend("waiting_003_01_01_Socialinvesting_StockPick"),
        requestRate: new Counter("rps_003_01_01_Socialinvesting_StockPick"),
        http_reqs: new Counter("sample_003_01_01_Socialinvesting_StockPick"),
    },
    Socialinvesting_CreateStockPick: {
        errorCount: new Counter("error_count_003_01_02_Socialinvesting_CreateStockPick"),
        errorRate: new Rate("error_rate_003_01_02_Socialinvesting_CreateStockPick"),
        httpDuration: new Trend("duration_003_01_02_Socialinvesting_CreateStockPick"),
        httpWaiting: new Trend("waiting_003_01_02_Socialinvesting_CreateStockPick"),
        requestRate: new Counter("rps_003_01_02_Socialinvesting_CreateStockPick"),
        http_reqs: new Counter("sample_003_01_02_Socialinvesting_CreateStockPick"),
    },
    Socialinvesting_StockPickID: {
        errorCount: new Counter("error_count_003_01_03_Socialinvesting_StockPickID"),
        errorRate: new Rate("error_rate_003_01_03_Socialinvesting_StockPickID"),
        httpDuration: new Trend("duration_003_01_03_Socialinvesting_StockPickID"),
        httpWaiting: new Trend("waiting_003_01_03_Socialinvesting_StockPickID"),
        requestRate: new Counter("rps_003_01_03_Socialinvesting_StockPickID"),
        http_reqs: new Counter("sample_003_01_03_Socialinvesting_StockPickID"),
    },
    Search_QuerySocialInvesting: {
        errorCount: new Counter("error_count_003_01_04_Search_QuerySocialInvesting"),
        errorRate: new Rate("error_rate_003_01_04_Search_QuerySocialInvesting"),
        httpDuration: new Trend("duration_003_01_04_Search_QuerySocialInvesting"),
        httpWaiting: new Trend("waiting_003_01_04_Search_QuerySocialInvesting"),
        requestRate: new Counter("rps_003_01_04_Search_QuerySocialInvesting"),
        http_reqs: new Counter("sample_003_01_04_Search_QuerySocialInvesting"),
    },
};

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + 7);

    const start_date = currentDate.toISOString();
    const end_date = futureDate.toISOString();

    // Batch 1
    let id;
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

                const socialinvestingStockPick = response.json();
                if (socialinvestingStockPick && socialinvestingStockPick.data && socialinvestingStockPick.data.length > 0) {
                    // ✅ CORRECTED: id is a string, not an array
                    id = socialinvestingStockPick.data[0].id;
                    
                    if (`${__ENV.ENV}` != 'INT') {
                        console.log(`Got Channel ID: ${id}`);
                    }
                } else {
                    console.error(`No Channel ID available`);
                }

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
    console.log(`channelId : ${channelId}`)
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/create-stock-pick`,
        ];

        const Socialinvesting_CreateStockPick_Payload = JSON.stringify({
            stock_code:"BBCA",
            entry_price_min: 5700,
            entry_price_max: 6100,
            take_profit:[
                {start:5800, end:4900},
                {start:6000, end:6100}
            ],
            stop_loss:5000,
            stock_pick_type:"DT",
            start_date:start_date,
            end_date:end_date,
            channel_id:channelId
        })

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
            ['POST', urls[0], Socialinvesting_CreateStockPick_Payload, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockPick.Socialinvesting_CreateStockPick,
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
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Request Body: ${requestBody} || Response Body: ${response.body}`);
                }
            }
        });
    }
    
    // Batch 3
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/stock-pick?id=${id}`,
        ];

        const stepThreeHeaders = {
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
            ['DELETE', urls[0], null, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                StockPick.Socialinvesting_StockPickID,
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
            const htmlPath = `../../../Report/Growin_Community/BP004/Manual/${__ENV.RUNBY}_Detail_BP004_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='Regression'){
            const htmlPath = `../../../Report/Growin_Community/BP004/Regression/${__ENV.RUNBY}_Detail_BP004_Web_${dateStr}_${timeStr}.html`;
            console.log(`Generating HTML: ${htmlPath}`);
            
            return {
                [htmlPath]: htmlReport(data),
                'stdout': textSummary(data, { indent: ' ', enableColors: true }),
            };
        } else if(`${__ENV.RUNBY}`=='LoadTest'){
            const htmlPath = `../../../Report/Growin_Community/BP004/LoadTest/${__ENV.RUNBY}_Detail_BP004_Web_${dateStr}_${timeStr}.html`;
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