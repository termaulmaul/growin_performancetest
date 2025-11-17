import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP006 - Profile Confirmation Page

// Define custom metrics
const SetMarginLimitPage = {
    Oaofinance_Margin_CalculateCollateral: {
        errorCount: new Counter("error_count_006_01_01_Oaofinance_Margin_CalculateCollateral"),
        errorRate: new Rate("error_rate_006_01_01_Oaofinance_Margin_CalculateCollateral"),
        httpDuration: new Trend("duration_006_01_01_Oaofinance_Margin_CalculateCollateral"),
        httpWaiting: new Trend("waiting_006_01_01_Oaofinance_Margin_CalculateCollateral"),
        requestRate: new Counter("rps_006_01_01_Oaofinance_Margin_CalculateCollateral"),
        http_reqs: new Counter("sample_006_01_01_Oaofinance_Margin_CalculateCollateral"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP006(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    // ✅ Get userKey dari VU mapping
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const email = userToken.email;

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/calculate-collateral`,
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

        const Oaofinance_Margin_CalculateCollateral_Payload = JSON.stringify({
            avail_cash: 50000000, 
            porto: [{market_value: 50000000}]
        });

        const requests = [
            ['POST', urls[0], Oaofinance_Margin_CalculateCollateral_Payload, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                SetMarginLimitPage.Oaofinance_Margin_CalculateCollateral,
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