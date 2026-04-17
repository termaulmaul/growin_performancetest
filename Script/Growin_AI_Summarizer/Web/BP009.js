import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /marketdata/api/v1/marketinfo/profile
// /marketdata/api/v1/key-statistic/eps
// /marketdata/api/v1/key-statistic/dividend
// /marketdata/api/v1/key-statistic/valuation
// /marketdata/api/v1/key-statistic/fundamentals
// /marketdata/api/v1/key-statistic/profitability
// /marketdata/api/v1/key-statistic/earnings
// /marketdata/api/v1/key-statistic/liquidity

// Marketdata_Marketinfo_Profile
// Marketdata_KeyStatistic_Eps
// Marketdata_KeyStatistic_Dividend
// Marketdata_KeyStatistic_Valuation
// Marketdata_KeyStatistic_Fundamentals
// Marketdata_KeyStatistic_Profitability
// Marketdata_KeyStatistic_Earnings
// Marketdata_KeyStatistic_Liquidity

// Define custom metrics
const FinancialSummarizerBackendNewsFeature = {
    Marketdata_Marketinfo_Profile: {
        errorCount: new Counter("error_count_009_01_01_Marketdata_Marketinfo_Profile"),
        errorRate: new Rate("error_rate_009_01_01_Marketdata_Marketinfo_Profile"),
        httpDuration: new Trend("duration_009_01_01_Marketdata_Marketinfo_Profile"),
        httpWaiting: new Trend("waiting_009_01_01_Marketdata_Marketinfo_Profile"),
        requestRate: new Counter("rps_009_01_01_Marketdata_Marketinfo_Profile"),
        http_reqs: new Counter("sample_009_01_01_Marketdata_Marketinfo_Profile"),
    },
    Marketdata_KeyStatistic_Eps: {
        errorCount: new Counter("error_count_009_01_02_Marketdata_KeyStatistic_Eps"),
        errorRate: new Rate("error_rate_009_01_02_Marketdata_KeyStatistic_Eps"),
        httpDuration: new Trend("duration_009_01_02_Marketdata_KeyStatistic_Eps"),
        httpWaiting: new Trend("waiting_009_01_02_Marketdata_KeyStatistic_Eps"),
        requestRate: new Counter("rps_009_01_02_Marketdata_KeyStatistic_Eps"),
        http_reqs: new Counter("sample_009_01_02_Marketdata_KeyStatistic_Eps"),
    },
    Marketdata_KeyStatistic_Dividend: {
        errorCount: new Counter("error_count_009_01_03_Marketdata_KeyStatistic_Dividend"),
        errorRate: new Rate("error_rate_009_01_03_Marketdata_KeyStatistic_Dividend"),
        httpDuration: new Trend("duration_009_01_03_Marketdata_KeyStatistic_Dividend"),
        httpWaiting: new Trend("waiting_009_01_03_Marketdata_KeyStatistic_Dividend"),
        requestRate: new Counter("rps_009_01_03_Marketdata_KeyStatistic_Dividend"),
        http_reqs: new Counter("sample_009_01_03_Marketdata_KeyStatistic_Dividend"),
    },
    Marketdata_KeyStatistic_Valuation: {
        errorCount: new Counter("error_count_009_01_04_Marketdata_KeyStatistic_Valuation"),
        errorRate: new Rate("error_rate_009_01_04_Marketdata_KeyStatistic_Valuation"),
        httpDuration: new Trend("duration_009_01_04_Marketdata_KeyStatistic_Valuation"),
        httpWaiting: new Trend("waiting_009_01_04_Marketdata_KeyStatistic_Valuation"),
        requestRate: new Counter("rps_009_01_04_Marketdata_KeyStatistic_Valuation"),
        http_reqs: new Counter("sample_009_01_04_Marketdata_KeyStatistic_Valuation"),
    },
    Marketdata_KeyStatistic_Fundamentals: {
        errorCount: new Counter("error_count_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        errorRate: new Rate("error_rate_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        httpDuration: new Trend("duration_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        httpWaiting: new Trend("waiting_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        requestRate: new Counter("rps_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
        http_reqs: new Counter("sample_009_01_05_Marketdata_KeyStatistic_Fundamentals"),
    },
    Marketdata_KeyStatistic_Profitability: {
        errorCount: new Counter("error_count_009_01_06_Marketdata_KeyStatistic_Profitability"),
        errorRate: new Rate("error_rate_009_01_06_Marketdata_KeyStatistic_Profitability"),
        httpDuration: new Trend("duration_009_01_06_Marketdata_KeyStatistic_Profitability"),
        httpWaiting: new Trend("waiting_009_01_06_Marketdata_KeyStatistic_Profitability"),
        requestRate: new Counter("rps_009_01_06_Marketdata_KeyStatistic_Profitability"),
        http_reqs: new Counter("sample_009_01_06_Marketdata_KeyStatistic_Profitability"),
    },
    Marketdata_KeyStatistic_Earnings: {
        errorCount: new Counter("error_count_009_01_07_Marketdata_KeyStatistic_Earnings"),
        errorRate: new Rate("error_rate_009_01_07_Marketdata_KeyStatistic_Earnings"),
        httpDuration: new Trend("duration_009_01_07_Marketdata_KeyStatistic_Earnings"),
        httpWaiting: new Trend("waiting_009_01_07_Marketdata_KeyStatistic_Earnings"),
        requestRate: new Counter("rps_009_01_07_Marketdata_KeyStatistic_Earnings"),
        http_reqs: new Counter("sample_009_01_07_Marketdata_KeyStatistic_Earnings"),
    },
    Marketdata_KeyStatistic_Liquidity: {
        errorCount: new Counter("error_count_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        errorRate: new Rate("error_rate_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        httpDuration: new Trend("duration_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        httpWaiting: new Trend("waiting_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        requestRate: new Counter("rps_009_01_08_Marketdata_KeyStatistic_Liquidity"),
        http_reqs: new Counter("sample_009_01_08_Marketdata_KeyStatistic_Liquidity"),
    }
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP009(data) {
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
            base_url + `/marketdata/api/v1/marketinfo/profile?seccode=BBRI`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendNewsFeature.Marketdata_Marketinfo_Profile,
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
            base_url + `/marketdata/api/v1/key-statistic/eps`,
            base_url + `/marketdata/api/v1/key-statistic/dividend`,
            base_url + `/marketdata/api/v1/key-statistic/valuation`,
            base_url + `/marketdata/api/v1/key-statistic/fundamentals`,
            base_url + `/marketdata/api/v1/key-statistic/profitability`,
            base_url + `/marketdata/api/v1/key-statistic/earnings`,
            base_url + `/marketdata/api/v1/key-statistic/liquidity`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['GET', urls[1], null, { headers: headers }],
            ['GET', urls[2], null, { headers: headers }],
            ['GET', urls[3], null, { headers: headers }],
            ['GET', urls[4], null, { headers: headers }],
            ['GET', urls[5], null, { headers: headers }],
            ['GET', urls[6], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Eps,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Dividend,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Valuation,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Fundamentals,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Profitability,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Earnings,
                FinancialSummarizerBackendNewsFeature.Marketdata_KeyStatistic_Liquidity,
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