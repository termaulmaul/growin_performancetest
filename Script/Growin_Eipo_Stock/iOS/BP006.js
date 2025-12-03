import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics
const OrderDetailScreen = {
    Eipo_CashLimit: {
        errorCount: new Counter("error_count_006_01_01_Eipo_CashLimit"),
        errorRate: new Rate("error_rate_006_01_01_Eipo_CashLimit"),
        httpDuration: new Trend("duration_006_01_01_Eipo_CashLimit"),
        httpWaiting: new Trend("waiting_006_01_01_Eipo_CashLimit"),
        requestRate: new Counter("rps_006_01_01_Eipo_CashLimit"),
        http_reqs: new Counter("sample_006_01_01_Eipo_CashLimit"),
    },
    Eipo_Pipeline_EMSM: {
        errorCount: new Counter("error_count_006_01_02_Eipo_Pipeline_EMSM"),
        errorRate: new Rate("error_rate_006_01_02_Eipo_Pipeline_EMSM"),
        httpDuration: new Trend("duration_006_01_02_Eipo_Pipeline_EMSM"),
        httpWaiting: new Trend("waiting_006_01_02_Eipo_Pipeline_EMSM"),
        requestRate: new Counter("rps_006_01_02_Eipo_Pipeline_EMSM"),
        http_reqs: new Counter("sample_006_01_02_Eipo_Pipeline_EMSM"),
    },
};

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
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
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/eipo/api/v1/cash-limit`,
            base_url + `/eipo/pipeline/EMSM`,
        ];

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
            ['GET', urls[1], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                OrderDetailScreen.Eipo_CashLimit,
                OrderDetailScreen.Eipo_Pipeline_EMSM
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