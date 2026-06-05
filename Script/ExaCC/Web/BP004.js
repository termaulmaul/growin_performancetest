import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /order/api/v1/protected/order-list

// ===================================================

// GET_Order_Protected_OrderList

// Define custom metrics
const Order_Protected_OrderList = {
    Order_Protected_OrderList: {
        errorCount: new Counter("error_count_001_01_04_Order_Protected_OrderList"),
        errorRate: new Rate("error_rate_001_01_04_Order_Protected_OrderList"),
        httpDuration: new Trend("duration_001_01_04_Order_Protected_OrderList"),
        httpWaiting: new Trend("waiting_001_01_04_Order_Protected_OrderList"),
        requestRate: new Counter("rps_001_01_04_Order_Protected_OrderList"),
        http_reqs: new Counter("sample_001_01_04_Order_Protected_OrderList"),
    },
};

export function BP004(data) {
    const vuId = exec.vu.idInTest;
        const base_url = data.base_url;
        const iterationId = exec.scenario.iterationInTest;
        const runTimestamp = Date.now();
        
        const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
        
        // ✅ Get mapping from setup
        const mapping = data.vuMapping[vuId];
        if (!mapping) {
            console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
            return;
        }
        
        const userKey = mapping.userKey;
        
        // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
        const userTokenData = data.tokens[userKey];
        
        if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
            console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
            return;
        }
        
        const token = userTokenData.token;
        const pinToken = userTokenData.pin_token;
        const email = userTokenData.email;

    // ─── Batch 1 - Login_PIN ───────────────────────────────────────────────────
    const headersAfterPin = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };

    // ─── Batch 2 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/order/api/v1/protected/order-list`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterPin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Order_Protected_OrderList.Order_Protected_OrderList
            ]

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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    sleep(0.25);
}