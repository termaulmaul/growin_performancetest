// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/OMO_Android/BP007.js
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
//BP007 - Collateral Submit Confirmation Page

const CollateralSubmitConfirmationPage = {
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_007_01_01_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_007_01_01_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_007_01_01_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_007_01_01_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_007_01_01_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_007_01_01_Oaofinance_Quota_Status_Margin"),
    },
    Oaofinance_MarginUser_CollateralAsset: {
        errorCount: new Counter("error_count_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        errorRate: new Rate("error_rate_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        httpDuration: new Trend("duration_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        httpWaiting: new Trend("waiting_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        requestRate: new Counter("rps_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
        http_reqs: new Counter("sample_007_01_02_Oaofinance_MarginUser_CollateralAsset"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dari setup
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

    let portfolio_id;
    let stock_code;
    let last_price;
    
    // Get eligible asset
    if (token) {
        const eligibleAssetHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };
        
        let res = http.get(base_url + '/oaofinance/api/v1/user/eligible-asset', { headers: eligibleAssetHeaders });
        
        if (res.status === 200) {
            const stocks = res.json().data.stocks;
            const selectedStock = stocks.find(stock => stock.share >= 100);
            
            if (selectedStock) {
                portfolio_id = selectedStock.portfolio_id;
                stock_code = selectedStock.stock_code;
                last_price = selectedStock.last_price;
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`VU${vuId} ${email} Selected Stock - ${stock_code} (${portfolio_id})`);
                }
            } else {
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`VU${vuId} ${email} No stock found with share >= 100`);
                }
                return; // Skip jika tidak ada stock yang eligible
            }
        } else {
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`VU${vuId} ${email} Failed to get eligible asset || Status: ${res.status}`);
            }
            return;
        }
    }
    
    // Batch 1 - Submit collateral (butuh PIN token)
    if (token && pin_token && portfolio_id && stock_code && last_price) {
        const urls = [
            base_url + `/oaofinance/api/v1/quota/status/margin`,
            base_url + `/oaofinance/api/v1/marginUser/collateral-asset`,
        ];

        const batchHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const Oaofinance_MarginUser_CollateralAsset_Payload = JSON.stringify({
            margin_limit: 100000000, 
            submitted_cash: 100000000, 
            submitted_stock: [{
                portfolio_id: String(portfolio_id),
                symbol: stock_code, 
                submitted_price: last_price, 
                submitted_unit: 100
            }]
        });

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
            ['POST', urls[1], Oaofinance_MarginUser_CollateralAsset_Payload, { headers: batchHeaders }],
        ];
        
        const responses = http.batch(requests);
        
        responses.forEach((response, index) => {
            const metrics = [
                CollateralSubmitConfirmationPage.Oaofinance_Quota_Status_Margin,
                CollateralSubmitConfirmationPage.Oaofinance_MarginUser_CollateralAsset,
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
                    console.log(`VU${vuId} ${email} SUCCESS ${urls[index]}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                // ENHANCE: Add low-cardinality tags to checks when swapping this enhanced file into runner.
check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`VU${vuId} ${email} ERROR ${urls[index]} || Status: ${response.status}`);
                }
            }
        });
    }
    
    // ENHANCE: Consider randomized think time to avoid artificial synchronized bursts.
sleep(0.15 + Math.random() * 0.2); // COMPAT: Preserve original 0.25s mean pacing; centered jitter 0.15-0.35s avoids RPS shift.
}