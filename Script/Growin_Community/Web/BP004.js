import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

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
        errorCount: new Counter("error_count_004_01_01_Socialinvesting_StockPick"),
        errorRate: new Rate("error_rate_004_01_01_Socialinvesting_StockPick"),
        httpDuration: new Trend("duration_004_01_01_Socialinvesting_StockPick"),
        httpWaiting: new Trend("waiting_004_01_01_Socialinvesting_StockPick"),
        requestRate: new Counter("rps_004_01_01_Socialinvesting_StockPick"),
        http_reqs: new Counter("sample_004_01_01_Socialinvesting_StockPick"),
    },
    Socialinvesting_CreateStockPick: {
        errorCount: new Counter("error_count_004_01_02_Socialinvesting_CreateStockPick"),
        errorRate: new Rate("error_rate_004_01_02_Socialinvesting_CreateStockPick"),
        httpDuration: new Trend("duration_004_01_02_Socialinvesting_CreateStockPick"),
        httpWaiting: new Trend("waiting_004_01_02_Socialinvesting_CreateStockPick"),
        requestRate: new Counter("rps_004_01_02_Socialinvesting_CreateStockPick"),
        http_reqs: new Counter("sample_004_01_02_Socialinvesting_CreateStockPick"),
    },
    Socialinvesting_StockPickID: {
        errorCount: new Counter("error_count_004_01_03_Socialinvesting_Delete_StockPickID"),
        errorRate: new Rate("error_rate_004_01_03_Socialinvesting_Delete_StockPickID"),
        httpDuration: new Trend("duration_004_01_03_Socialinvesting_Delete_StockPickID"),
        httpWaiting: new Trend("waiting_004_01_03_Socialinvesting_Delete_StockPickID"),
        requestRate: new Counter("rps_004_01_03_Socialinvesting_Delete_StockPickID"),
        http_reqs: new Counter("sample_004_01_03_Socialinvesting_Delete_StockPickID"),
    },
    Search_QuerySocialInvesting: {
        errorCount: new Counter("error_count_004_01_04_Search_QuerySocialInvesting"),
        errorRate: new Rate("error_rate_004_01_04_Search_QuerySocialInvesting"),
        httpDuration: new Trend("duration_004_01_04_Search_QuerySocialInvesting"),
        httpWaiting: new Trend("waiting_004_01_04_Search_QuerySocialInvesting"),
        requestRate: new Counter("rps_004_01_04_Search_QuerySocialInvesting"),
        http_reqs: new Counter("sample_004_01_04_Search_QuerySocialInvesting"),
    },
};

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ✅ FIXED FUNCTION - menggunakan bpTokens untuk mapping yang benar
export function BP004(data) {
    const scenarioName = 'BP004';
    const base_url = data.base_url;
    const isIntEnv = `${__ENV.ENV}` === 'INT';
    
    // ✅ GET CORRECT TOKEN FROM BP-SPECIFIC ARRAY
    const bp004Tokens = data.bpTokens[scenarioName];
    if (!bp004Tokens || bp004Tokens.length === 0) {
        console.error(`❌ ${scenarioName} - No tokens available!`);
        return;
    }
    
    // ✅ USE ITERATION INDEX TO GET CORRECT USER
    const iterationIndex = exec.scenario.iterationInInstance;
    const tokenIndex = iterationIndex % bp004Tokens.length; // Wrap around if iterations > tokens
    
    const userToken = bp004Tokens[tokenIndex];
    if (!userToken || !userToken.token) {
        console.error(`❌ ${scenarioName} Iteration ${iterationIndex} - No valid token at index ${tokenIndex}!`);
        return;
    }
    
    // ✅ CRITICAL VALIDATION - ENSURE CORRECT POOL
    if (userToken.pool !== 'SUHU') {
        console.error(`❌ CRITICAL: ${scenarioName} using ${userToken.pool} user (${userToken.email}) instead of SUHU! ABORTING.`);
        return;
    }
    
    // // ✅ DEBUG LOG - Confirm correct mapping
    // console.log(`🔍 ${scenarioName} K6-VU${__VU} Iter${iterationIndex} → Setup-VU${userToken.vuId} → User${userToken.userNum} (${userToken.email}) | Pool: ${userToken.pool} ✅`);
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;

    const channel_id = getChannelId(base_url, token, scenarioName, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        return;
    }

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + 7);

    const start_date = currentDate.toISOString();
    const end_date = futureDate.toISOString();

    // Batch 2 - CREATE stock pick
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
            channel_id:channel_id
        })

        const stepTwoHeaders = {
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
            const metric = StockPick.Socialinvesting_CreateStockPick;
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                // console.log(`${email} channel_id create stock pick : ${channel_id}`)
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

    // Batch 1 - GET stock pick list
    let id;
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/stock-pick?channel_id=${channel_id}&page=1&limit=10`,
        ]

        const stepOneHeaders = {
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

        // ✅ EXTRACT ID FIRST
        const response = responses[0];
        if (response.status === 200) {
            try {
                const socialinvestingStockPick = response.json();
                if (socialinvestingStockPick?.data?.length > 0) {
                    const allIds = socialinvestingStockPick.data.map(item => item.id);
                    // console.log(`${email} ✅ All IDs (${allIds.length}):`, allIds);

                    id = socialinvestingStockPick.data[0].id;
                    // console.log(`${email} ✅ Got ID Stock Pick: ${id}`);
                } else {
                    console.error(`${email} ❌ No stock picks in response - data array is empty`);
                }
            } catch (e) {
                console.error(`${email} ❌ Failed to parse response: ${e.message}`);
            }
        } else {
            console.error(`${email} ❌ Request failed with status: ${response.status} || Body: ${response.body}`);
        }

        // Process metrics
        responses.forEach((response, index) => {
            const metric = StockPick.Socialinvesting_StockPick;
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                // console.log(`${email} channel_id stock pick : ${channel_id}`)
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status}`]: (r) => r.status === 200
                });
            }
        });
    }
    
    // Batch 3
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/stock-pick?id=${id}`,
        ];

        const stepThreeHeaders = {
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