import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/stock-pick?channel_id=f3dbab75-573d-49d2-a573-78b244d39b8a&page=1&limit=10
// /socialinvesting/api/v1/search/query-social-investing

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

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP003(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;
    const isIntEnv = `${__ENV.ENV}` === 'INT';

    const channel_id = getChannelId(base_url, token, bp, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/stock-pick?channel_id=${channel_id}&page=1&limit=10`,
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
    
    // Batch 2
    if (token) {
        const urls = [
            base_url + `/search/query-social-investing?keywords=BMRI`,
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
    
    sleep(0.5);
}