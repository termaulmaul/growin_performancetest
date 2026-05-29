// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Eipo_Stock/iOS/BP003.js
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

// BP003 – Detail Screen
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
            metric.httpWaiting && metric.httpWaiting.add(response.timings.waiting); // ENHANCE-R1: record waiting time
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    // ENHANCE: Truncate response body under load before enabling this log in production.
console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }
    
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}