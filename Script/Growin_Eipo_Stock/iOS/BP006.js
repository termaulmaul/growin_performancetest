import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// BP006 – Create Order
// Define custom metrics
const OrderFormScreen = {
    Eipo_CashLimit: {
        errorCount: new Counter("error_count_006_01_01_Eipo_CashLimit"),
        errorRate: new Rate("error_rate_006_01_01_Eipo_CashLimit"),
        httpDuration: new Trend("duration_006_01_01_Eipo_CashLimit"),
        httpWaiting: new Trend("waiting_006_01_01_Eipo_CashLimit"),
        requestRate: new Counter("rps_006_01_01_Eipo_CashLimit"),
        http_reqs: new Counter("sample_006_01_01_Eipo_CashLimit"),
    },
    Eipo_Order: {
        errorCount: new Counter("error_count_006_01_02_Eipo_Order"),
        errorRate: new Rate("error_rate_006_01_02_Eipo_Order"),
        httpDuration: new Trend("duration_006_01_02_Eipo_Order"),
        httpWaiting: new Trend("waiting_006_01_02_Eipo_Order"),
        requestRate: new Counter("rps_006_01_02_Eipo_Order"),
        http_reqs: new Counter("sample_006_01_02_Eipo_Order"),
    },
    Eipo_Pipeline_EMSM: {
        errorCount: new Counter("error_count_006_01_03_Eipo_Pipeline_EMSM"),
        errorRate: new Rate("error_rate_006_01_03_Eipo_Pipeline_EMSM"),
        httpDuration: new Trend("duration_006_01_03_Eipo_Pipeline_EMSM"),
        httpWaiting: new Trend("waiting_006_01_03_Eipo_Pipeline_EMSM"),
        requestRate: new Counter("rps_006_01_03_Eipo_Pipeline_EMSM"),
        http_reqs: new Counter("sample_006_01_03_Eipo_Pipeline_EMSM"),
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
        ];

        const stepOneHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
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
                OrderFormScreen.Eipo_CashLimit,
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
            // base_url + `/eipo/order`,
            base_url + `/eipo/mock/order`,
        ];

        const EIPO_Order_Payload = JSON.stringify({
            qty: '1',
            is_beneficiary_owner: 'false',
            is_employee: 'false',
            pipeline: 'JANA',
            is_automatic_confirmation: true,
            is_affiliated: 'false',
            price: '200'
        });

        const stepTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], EIPO_Order_Payload, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                OrderFormScreen.Eipo_Order,
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
            base_url + `/eipo/pipeline/EMSM`,
        ];

        const stepThreeHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                OrderFormScreen.Eipo_Pipeline_EMSM,
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
    // sleep(0.25);
}