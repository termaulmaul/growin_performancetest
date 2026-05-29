// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Eipo_Stock/iOS/BP007.js
 *
 * ENHANCE: Original file preserved; runner import not swapped.
 * ENHANCE: Metric names intentionally unchanged to avoid Grafana/Jenkins drift.
 * ENHANCE: Review comments mark safe improvement points: debug logging, body truncation, tags, retry, timeout, randomized think time.
 * ENHANCE: No broad behavior rewrite here because this legacy script has bespoke auth/setup flow.
 * ENHANCE: Promote only after k6 smoke + Grafana compare.
 */

import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// BP007 – Edit Order
// Define custom metrics
const EditOrderScreen = {
    Eipo_Order: {
        errorCount: new Counter("error_count_007_01_01_Amend_Eipo_Order"),
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
            // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`User ${email} Order Success || Status: ${res.status} || Body: ${res.body}`);
        }
    } else {
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`User ${email} Order Failed - Status: ${res.status} || Body: ${res.body}`);
        }
    }
    // // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.

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
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 202) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 202
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }
    // sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}