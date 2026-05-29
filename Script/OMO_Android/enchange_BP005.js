// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/OMO_Android/BP005.js
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

// ##READ ME
//BP005 - Profile Confirmation Page

// Define custom metrics
const CollateralSetupPage = {
    Oaofinance_Margin_MinTotalCollateralAssetsValue: {
        errorCount: new Counter("error_count_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        errorRate: new Rate("error_rate_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpDuration: new Trend("duration_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpWaiting: new Trend("waiting_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        requestRate: new Counter("rps_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        http_reqs: new Counter("sample_005_01_01_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
    },
    Oaofinance_User_EligibleAsset: {
        errorCount: new Counter("error_count_005_01_02_Oaofinance_User_EligibleAsset"),
        errorRate: new Rate("error_rate_005_01_02_Oaofinance_User_EligibleAsset"),
        httpDuration: new Trend("duration_005_01_02_Oaofinance_User_EligibleAsset"),
        httpWaiting: new Trend("waiting_005_01_02_Oaofinance_User_EligibleAsset"),
        requestRate: new Counter("rps_005_01_02_Oaofinance_User_EligibleAsset"),
        http_reqs: new Counter("sample_005_01_02_Oaofinance_User_EligibleAsset"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP005(data) {
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
            base_url + `/oaofinance/api/v1/margin/min-total-collateral-assets-value`,
            base_url + `/oaofinance/api/v1/user/eligible-asset`,
        ];

        const stepOneHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            // ENHANCE: Prefer per-VU device id when backend allows it; static id can distort realism.
        'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
            ['GET', urls[1], undefined, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CollateralSetupPage.Oaofinance_Margin_MinTotalCollateralAssetsValue,
                CollateralSetupPage.Oaofinance_User_EligibleAsset,
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