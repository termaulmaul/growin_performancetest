import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics
const DetailScreen = {
    Eipo_Pipeline_CRIM_Timeline: {
        errorCount: new Counter("error_count_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
        errorRate: new Rate("error_rate_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
        httpDuration: new Trend("duration_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
        httpWaiting: new Trend("waiting_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
        requestRate: new Counter("rps_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
        http_reqs: new Counter("sample_003_01_01_Eipo_Pipeline_CRIM_Timeline"),
    },
    Eipo_Investor: {
        errorCount: new Counter("error_count_003_01_02_Eipo_Investor"),
        errorRate: new Rate("error_rate_003_01_02_Eipo_Investor"),
        httpDuration: new Trend("duration_003_01_02_Eipo_Investor"),
        httpWaiting: new Trend("waiting_003_01_02_Eipo_Investor"),
        requestRate: new Counter("rps_003_01_02_Eipo_Investor"),
        http_reqs: new Counter("sample_003_01_02_Eipo_Investor"),
    },
    Eipo_Pipeline_CRIM: {
        errorCount: new Counter("error_count_003_01_03_Eipo_Pipeline_CRIM"),
        errorRate: new Rate("error_rate_003_01_03_Eipo_Pipeline_CRIM"),
        httpDuration: new Trend("duration_003_01_03_Eipo_Pipeline_CRIM"),
        httpWaiting: new Trend("waiting_003_01_03_Eipo_Pipeline_CRIM"),
        requestRate: new Counter("rps_003_01_03_Eipo_Pipeline_CRIM"),
        http_reqs: new Counter("sample_003_01_03_Eipo_Pipeline_CRIM"),
    },
};

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
export function BP003(data) {
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
            base_url + `/eipo/pipeline/CRIM/timeline`,
            base_url + `/eipo/investor`,
            base_url + `/eipo/pipeline/CRIM`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
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
            ['GET', urls[1], null, { headers: stepOneHeaders }],
            ['GET', urls[2], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                DetailScreen.Eipo_Pipeline_CRIM_Timeline,
                DetailScreen.Eipo_Investor,
                DetailScreen.Eipo_Pipeline_CRIM,
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