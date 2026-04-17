import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// GET	/marketdata/api/v1/broker-activity?stock_symbol=BBCA&start_date=2026-02-09&end_date=2026-02-09&is_net=false&domicile=
// GET	/marketdata/api/v1/brokers-map
// GET	/marketdata/api/v1/stock-strength

// Marketdata_BrokerActivity
// Marketdata_BrokersMap
// Marketdata_StockStrength

// Define custom metrics
const FinancialSummarizerBackendBrokerActivityTab = {
    Marketdata_BrokerActivity: {
        errorCount: new Counter("error_count_013_01_01_Marketdata_BrokerActivity"),
        errorRate: new Rate("error_rate_013_01_01_Marketdata_BrokerActivity"),
        httpDuration: new Trend("duration_013_01_01_Marketdata_BrokerActivity"),
        httpWaiting: new Trend("waiting_013_01_01_Marketdata_BrokerActivity"),
        requestRate: new Counter("rps_013_01_01_Marketdata_BrokerActivity"),
        http_reqs: new Counter("sample_013_01_01_Marketdata_BrokerActivity"),
    },
    Marketdata_BrokersMap: {
        errorCount: new Counter("error_count_013_01_02_Marketdata_BrokersMap"),
        errorRate: new Rate("error_rate_013_01_02_Marketdata_BrokersMap"),
        httpDuration: new Trend("duration_013_01_02_Marketdata_BrokersMap"),
        httpWaiting: new Trend("waiting_013_01_02_Marketdata_BrokersMap"),
        requestRate: new Counter("rps_013_01_02_Marketdata_BrokersMap"),
        http_reqs: new Counter("sample_013_01_02_Marketdata_BrokersMap"),
    },
    Marketdata_StockStrength: {
        errorCount: new Counter("error_count_013_01_03_Marketdata_StockStrength"),
        errorRate: new Rate("error_rate_013_01_03_Marketdata_StockStrength"),
        httpDuration: new Trend("duration_013_01_03_Marketdata_StockStrength"),
        httpWaiting: new Trend("waiting_013_01_03_Marketdata_StockStrength"),
        requestRate: new Counter("rps_013_01_03_Marketdata_StockStrength"),
        http_reqs: new Counter("sample_013_01_03_Marketdata_StockStrength"),
    }
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP013(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        //  || !userToken.pin_token
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const user_id = userToken.user_id;
    const client_id = userToken.client_id;
    const SID = userToken.SID;
    const ksei_acc_no = userToken.ksei_acc_no;
    const account_name = userToken.account_name;
    const email = userToken.email;
    const bp = mapping.bp;

    const headers = {
        'Cookie': `ACCESS_TOKEN=${token};`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3'
    };

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/broker-activity?stock_symbol=BBCA&start_date=2026-02-09&end_date=2026-02-09&is_net=false&domicile=`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendBrokerActivityTab.Marketdata_BrokerActivity,
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
            base_url + `/marketdata/api/v1/brokers-map`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendBrokerActivityTab.Marketdata_BrokersMap,
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

    // Batch 3
    if (token) {
        const urls = [
            base_url + `/marketdata/api/v1/stock-strength?stockcode=BBCA&resolution=5`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendBrokerActivityTab.Marketdata_StockStrength,
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