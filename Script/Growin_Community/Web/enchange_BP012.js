// ENHANCE-REFRESH: v1 // refresh v1 (R1..R6). Original preserved.
/**
 * ENHANCED SIBLING - generated safe baseline.
 * Original: Script/Growin_Community/Web/BP012.js
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
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';
// ENHANCE: Keep imports/exports compatible with original runner; no automatic import swap.

// /socialinvesting/api/v1/portfolio-sharing/share-to-community?portfolio_id=string&template_type=bear-metal&channel_id=string&channel_type=string

// Socialinvesting_PortfolioSharing_ShareToCommunity

// Define custom metrics
const SharePortfolio = {
    Socialinvesting_PortfolioSharing_ShareToCommunity: {
        errorCount: new Counter("error_count_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        errorRate: new Rate("error_rate_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpDuration: new Trend("duration_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        httpWaiting: new Trend("waiting_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        requestRate: new Counter("rps_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
        http_reqs: new Counter("sample_012_01_01_Socialinvesting_PortfolioSharing_ShareToCommunity"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP012(data) {
    const scenarioName = 'BP012';
    const base_url = data.base_url;
    const isIntEnv = `${__ENV.ENV}` === 'INT';
    
    // ✅ GET CORRECT TOKEN FROM BP-SPECIFIC ARRAY
    const bp012Tokens = data.bpTokens[scenarioName];
    if (!bp012Tokens || bp012Tokens.length === 0) {
        console.error(`❌ ${scenarioName} - No tokens available!`);
        return;
    }
    
    // ✅ USE ITERATION INDEX TO GET CORRECT USER
    const iterationIndex = exec.scenario.iterationInInstance;
    const tokenIndex = iterationIndex % bp012Tokens.length; // Wrap around if iterations > tokens
    
    const userToken = bp012Tokens[tokenIndex];
    if (!userToken || !userToken.token) {
        console.error(`❌ ${scenarioName} Iteration ${iterationIndex} - No valid token at index ${tokenIndex}!`);
        return;
    }
    
    // ✅ CRITICAL VALIDATION - ENSURE CORRECT POOL
    if (userToken.pool !== 'REGULAR') {
        console.error(`❌ CRITICAL: ${scenarioName} using ${userToken.pool} user (${userToken.email}) instead of REGULAR! ABORTING.`);
        return;
    }
    
    // // ✅ DEBUG LOG - Confirm correct mapping
    // console.log(`🔍 ${scenarioName} K6-VU${__VU} Iter${iterationIndex} → Setup-VU${userToken.vuId} → User${userToken.userNum} (${userToken.email}) | Pool: ${userToken.pool} ✅`);
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    // const bp = mapping.bp;

    // // Final safety check sebelum melanjutkan ke API calls
    // if (!channel_id) {
    //     console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
    //     // SystemMetrics.noChannelFound.add(1);
    //     return;
    // }

    // Portfolio ID
    let portfolio_id;
    const user_Portfolio_Stock_Headers = {
        // 'Cookie': `ACCESS_TOKEN=${token}`,
        // 'Content-Type': 'application/json',

        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pin_token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    let resUserPortfolioStock = http.get(base_url + `/user/api/protected/v2/portfolio/stock`, { headers: user_Portfolio_Stock_Headers })

    if (resUserPortfolioStock.status === 200) {
        const UserPortfolioStock = resUserPortfolioStock.json();
        portfolio_id = UserPortfolioStock.data[0].PortfolioId;
        
        // console.log(UserPortfolioStock);
    } else {
        console.error(`${email} UserPortfolioStock Failed - Status: ${resUserPortfolioStock.status} - Body: ${resUserPortfolioStock.body}`);
    }

    const channel_id = getChannelId(base_url, token, scenarioName, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    if (token && portfolio_id && channel_id) {
        const urls = [
            base_url + `/socialinvesting/api/v1/portfolio-sharing/share-to-community?portfolio_id=${portfolio_id}&template_type=bear-metal&channel_id=${channel_id}&channel_type=messaging`,
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
            ['GET', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                SharePortfolio.Socialinvesting_PortfolioSharing_ShareToCommunity,
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
                    [`${email} ERROR ${urls[index]} || Email : ${email} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${String(response.body).slice(0, 500)} || Request Body: ${requestBody}`) /* ENHANCE-R4: body truncated */;
                }
            }
        });
    }
    
    sleep(0.5);
}