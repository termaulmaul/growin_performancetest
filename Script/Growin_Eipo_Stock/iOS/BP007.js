import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// BP007 – Edit Order
// Define custom metrics
const EditOrderScreen = {
    Eipo_Order: {
        errorCount: new Counter("error_count_007_01_01_Amend_Amend_Eipo_Order"),
        errorRate: new Rate("error_rate_007_01_01_Amend_Eipo_Order"),
        httpDuration: new Trend("duration_007_01_01_Amend_Eipo_Order"),
        httpWaiting: new Trend("waiting_007_01_01_Amend_Eipo_Order"),
        requestRate: new Counter("rps_007_01_01_Amend_Eipo_Order"),
        http_reqs: new Counter("sample_007_01_01_Amend_Eipo_Order"),
    },
};

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
export function BP007(data) {
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

    const EIPO_Order_Payload = JSON.stringify({
        qty: '1',
        is_beneficiary_owner: 'false',
        is_employee: 'false',
        pipeline: 'JANA',
        is_automatic_confirmation: true,
        is_affiliated: 'false',
        price: '200'
    });

    const orderHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    let res = http.post(base_url + '/eipo/mock/order', EIPO_Order_Payload, { headers: orderHeaders, timeout: '5m' });

    let orderID = null;

    if (res.status === 200) {
        orderID = res.json().data.id;
        if (`${__ENV.ENV}` != 'INT') {
            console.log(`User ${email} Order Success || Status: ${res.status} || Body: ${res.body}`);
        }
    } else {
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`User ${email} Order Failed - Status: ${res.status} || Body: ${res.body}`);
        }
    }
    // sleep(0.25);

    // Batch 1
    if (token && orderID) {
        const urls = [
            base_url + `/eipo/mock/order`,
        ];

        const EIPO_Order_Payload = JSON.stringify({
            id: orderID,
            qty: '2',
        });

        const stepOneHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['PATCH', urls[0], EIPO_Order_Payload, { headers: stepOneHeaders, timeout: '5m' }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                EditOrderScreen.Eipo_Order,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 202) {
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
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 202
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