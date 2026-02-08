import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/social/request-kick-member?channel_id=1

// Socialinvesting_Social_RequestKickMember

// Define custom metrics
const AddKickRequestFromSuhuToAdmin = {
    Socialinvesting_Social_RequestKickMember: {
        errorCount: new Counter("error_count_013_01_01_Socialinvesting_Social_RequestKickMember"),
        errorRate: new Rate("error_rate_013_01_01_Socialinvesting_Social_RequestKickMember"),
        httpDuration: new Trend("duration_013_01_01_Socialinvesting_Social_RequestKickMember"),
        httpWaiting: new Trend("waiting_013_01_01_Socialinvesting_Social_RequestKickMember"),
        requestRate: new Counter("rps_013_01_01_Socialinvesting_Social_RequestKickMember"),
        http_reqs: new Counter("sample_013_01_01_Socialinvesting_Social_RequestKickMember"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP013(data) {
    const scenarioName = 'BP013';
    const base_url = data.base_url;
    const isIntEnv = `${__ENV.ENV}` === 'INT';
    
    // ✅ GET CORRECT TOKEN FROM BP-SPECIFIC ARRAY
    const bp013Tokens = data.bpTokens[scenarioName];
    if (!bp013Tokens || bp013Tokens.length === 0) {
        console.error(`❌ ${scenarioName} - No tokens available!`);
        return;
    }
    
    // ✅ USE ITERATION INDEX TO GET CORRECT USER
    const iterationIndex = exec.scenario.iterationInInstance;
    const tokenIndex = iterationIndex % bp013Tokens.length; // Wrap around if iterations > tokens
    
    const userToken = bp013Tokens[tokenIndex];
    if (!userToken || !userToken.token) {
        console.error(`❌ ${scenarioName} Iteration ${iterationIndex} - No valid token at index ${tokenIndex}!`);
        return;
    }
    
    // ✅ CRITICAL VALIDATION - ENSURE CORRECT POOL
    if (userToken.pool !== 'SUHU') {
        console.error(`❌ CRITICAL: ${scenarioName} using ${userToken.pool} user (${userToken.email}) instead of SUHU! ABORTING.`);
        return;
    }
    
    // // ✅ DEBUG LOG - Confirm correct mapping
    // console.log(`🔍 ${scenarioName} K6-VU${__VU} Iter${iterationIndex} → Setup-VU${userToken.vuId} → User${userToken.userNum} (${userToken.email}) | Pool: ${userToken.pool} ✅`);
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;

    const channel_id = getChannelId(base_url, token, scenarioName, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/request-kick-member?channel_id=${channel_id}`,
        ];

        const Socialinvesting_Social_RequestKickMember_Payload = JSON.stringify({
            community_ids: [channel_id],
        });

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
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['POST', urls[0], Socialinvesting_Social_RequestKickMember_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                AddKickRequestFromSuhuToAdmin.Socialinvesting_Social_RequestKickMember,
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
    
    sleep(0.5);
}