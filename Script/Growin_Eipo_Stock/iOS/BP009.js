import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics
const WithdrawOrderScreen = {
    Delete_Eipo_Order: {
        errorCount: new Counter("error_count_009_01_01_Delete_Eipo_Order"),
        errorRate: new Rate("error_rate_009_01_01_Delete_Eipo_Order"),
        httpDuration: new Trend("duration_009_01_01_Delete_Eipo_Order"),
        httpWaiting: new Trend("waiting_009_01_01_Delete_Eipo_Order"),
        requestRate: new Counter("rps_009_01_01_Delete_Eipo_Order"),
        http_reqs: new Counter("sample_009_01_01_Delete_Eipo_Order"),
    },
    Eipo_Order: {
        errorCount: new Counter("error_count_009_01_02_Eipo_Order"),
        errorRate: new Rate("error_rate_009_01_02_Eipo_Order"),
        httpDuration: new Trend("duration_009_01_02_Eipo_Order"),
        httpWaiting: new Trend("waiting_009_01_02_Eipo_Order"),
        requestRate: new Counter("rps_009_01_02_Eipo_Order"),
        http_reqs: new Counter("sample_009_01_02_Eipo_Order"),
    },
};

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

    // ✅ ADD NAME TAG to group all order creation requests
    let res = http.post(base_url + '/eipo/mock/order', EIPO_Order_Payload, { headers: orderHeaders, tags: { name: 'Create_EIPO_Order' }});

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
    sleep(0.25);

    // Batch 1 - Delete Order
    if (token && orderID) {
        const stepOneHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        // ✅ ADD NAME TAG to group all delete requests
        const requests = [
            ['DELETE', base_url + `/eipo/mock/order/${orderID}`, null, { headers: stepOneHeaders, tags: { name: 'Delete_EIPO_Order' }} ],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = WithdrawOrderScreen.Delete_Eipo_Order;

            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} Delete Order ${orderID} || Status: ${response.status}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR Delete Order || Status: ${response.status}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR Delete Order || Status: ${response.status} || Response Body: ${response.body}`);
                }
            }
        });
    }

    // Batch 2 - Get Orders List
    if (token && orderID) {
        const stepTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        // ✅ ADD NAME TAG - this URL is already good (no dynamic ID)
        const requests = [
            ['GET', base_url + `/eipo/mock/order?page=1&per_page=20`, null, { headers: stepTwoHeaders, tags: { name: 'Get_EIPO_Orders' } }], // ✅ Groups all list requests 
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = WithdrawOrderScreen.Eipo_Order;

            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} Get Orders || Status: ${response.status}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR Get Orders || Status: ${response.status}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR Get Orders || Status: ${response.status} || Response Body: ${response.body}`);
                }
            }
        });
    }
    
    sleep(0.25);
}