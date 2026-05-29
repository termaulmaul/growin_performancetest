// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_OMO/iOS/BP001.js
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

// /oaofinance/api/v1/margin/financing-detail?content_type=margin
// /oaofinance/api/v1/margin/benefit
// /oaofinance/api/v1/margin/leverage-fee
// /oaofinance/api/v1/margin/eligibility

// Oaofinance_Margin_FinancingDetail_Margin
// Oaofinance_Margin_Benefit
// Oaofinance_Margin_LeverageFee
// Oaofinance_Margin_Eligibility

// Define custom metrics (unchanged)
const MarginInformationScreen = {
    Oaofinance_Margin_FinancingDetail_Margin: {
        errorCount: new Counter("error_count_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
        errorRate: new Rate("error_rate_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
        httpDuration: new Trend("duration_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
        httpWaiting: new Trend("waiting_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
        requestRate: new Counter("rps_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
        http_reqs: new Counter("sample_001_01_01_Oaofinance_Margin_FinancingDetail_Margin"),
    },
    Oaofinance_Margin_Benefit: {
        errorCount: new Counter("error_count_001_01_02_Oaofinance_Margin_Benefit"),
        errorRate: new Rate("error_rate_001_01_02_Oaofinance_Margin_Benefit"),
        httpDuration: new Trend("duration_001_01_02_Oaofinance_Margin_Benefit"),
        httpWaiting: new Trend("waiting_001_01_02_Oaofinance_Margin_Benefit"),
        requestRate: new Counter("rps_001_01_02_Oaofinance_Margin_Benefit"),
        http_reqs: new Counter("sample_001_01_02_Oaofinance_Margin_Benefit"),
    },
    Oaofinance_Margin_LeverageFee: {
        errorCount: new Counter("error_count_001_01_03_Oaofinance_Margin_LeverageFee"),
        errorRate: new Rate("error_rate_001_01_03_Oaofinance_Margin_LeverageFee"),
        httpDuration: new Trend("duration_001_01_03_Oaofinance_Margin_LeverageFee"),
        httpWaiting: new Trend("waiting_001_01_03_Oaofinance_Margin_LeverageFee"),
        requestRate: new Counter("rps_001_01_03_Oaofinance_Margin_LeverageFee"),
        http_reqs: new Counter("sample_001_01_03_Oaofinance_Margin_LeverageFee"),
    },
    Oaofinance_Margin_Eligibility: {
        errorCount: new Counter("error_count_001_01_04_Oaofinance_Margin_Eligibility"),
        errorRate: new Rate("error_rate_001_01_04_Oaofinance_Margin_Eligibility"),
        httpDuration: new Trend("duration_001_01_04_Oaofinance_Margin_Eligibility"),
        httpWaiting: new Trend("waiting_001_01_04_Oaofinance_Margin_Eligibility"),
        requestRate: new Counter("rps_001_01_04_Oaofinance_Margin_Eligibility"),
        http_reqs: new Counter("sample_001_01_04_Oaofinance_Margin_Eligibility"),
    },
};

export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    // ✅ Get mapping from setup
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
        return;
    }
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headers = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3',
        // 'X-Device-Id': deviceId,
    };

    // Batch 1 - Get device list
    const urls = [
        // base_url + `/oaofinance/api/v1/margin/financing-detail?content_type=margin`,
        // base_url + `/oaofinance/api/v1/margin/benefit`,
        // base_url + `/oaofinance/api/v1/margin/leverage-fee`,
        base_url + `/oaofinance/api/v1/margin/eligibility`,
    ];

    const requests = [
        ['GET', urls[0], null, { headers: headers }],
        // ['GET', urls[1], null, { headers: headers }],
        // ['GET', urls[2], null, { headers: headers }],
        // ['GET', urls[3], null, { headers: headers }],
    ];
    const responses = http.batch(requests);

    responses.forEach((response, index) => {
        const metrics = [
            // MarginInformationScreen.Oaofinance_Margin_FinancingDetail_Margin,
            // MarginInformationScreen.Oaofinance_Margin_Benefit,
            // MarginInformationScreen.Oaofinance_Margin_LeverageFee,
            MarginInformationScreen.Oaofinance_Margin_Eligibility,
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
console.log(`${email} ${urls[index]} || Status: ${response.status} || Response: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestRate.add(false);
            metric.http_reqs.add(1);
            
            // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                [`ERROR ${urls[index]} || Status: ${response.status}  || Response: ${response.body}`]: (r) => r.status === 200
            });
            
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${String(response.body).slice(0, 500)}`) /* ENHANCE-R4: body truncated */;
            }
        }
    });
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}