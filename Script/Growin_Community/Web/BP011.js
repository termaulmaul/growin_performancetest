import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/social/get-kick-request?channel_id=1&limit=1&page=1
// /socialinvesting/api/v1/social/update-kick-request?channel_id=${param.channel_id}
// /socialinvesting/api/v1/social/remove-by-admin?channel_id=${param.channel_id}

// Socialinvesting_Socialinvesting_Social_GetKickRequest
// Socialinvesting_Socialinvesting_Social_UpdateKickRequest
// Socialinvesting_Socialinvesting_Social_RemoveByAdmin

// Define custom metrics
const CommunityMemberKickRequestApproval = {
    Socialinvesting_Social_GetKickRequest: {
        errorCount: new Counter("error_count_011_01_01_Socialinvesting_Social_GetKickRequest"),
        errorRate: new Rate("error_rate_011_01_01_Socialinvesting_Social_GetKickRequest"),
        httpDuration: new Trend("duration_011_01_01_Socialinvesting_Social_GetKickRequest"),
        httpWaiting: new Trend("waiting_011_01_01_Socialinvesting_Social_GetKickRequest"),
        requestRate: new Counter("rps_011_01_01_Socialinvesting_Social_GetKickRequest"),
        http_reqs: new Counter("sample_011_01_01_Socialinvesting_Social_GetKickRequest"),
    },
    Socialinvesting_Social_UpdateKickRequest: {
        errorCount: new Counter("error_count_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
        errorRate: new Rate("error_rate_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
        httpDuration: new Trend("duration_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
        httpWaiting: new Trend("waiting_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
        requestRate: new Counter("rps_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
        http_reqs: new Counter("sample_011_01_02_Socialinvesting_Social_UpdateKickRequest"),
    },
    Socialinvesting_Social_RemoveByAdmin: {
        errorCount: new Counter("error_count_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
        errorRate: new Rate("error_rate_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
        httpDuration: new Trend("duration_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
        httpWaiting: new Trend("waiting_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
        requestRate: new Counter("rps_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
        http_reqs: new Counter("sample_011_01_03_Socialinvesting_Social_RemoveByAdmin"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP011(data) {
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
    const bp = mapping.bp;
    const isIntEnv = `${__ENV.ENV}` === 'INT';

    const channel_id = getChannelId(base_url, token, bp, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    if (!channel_id) {
        console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
        // SystemMetrics.noChannelFound.add(1);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/get-kick-request?channel_id=${channel_id}&limit=1&page=1`,
        ];

        const stepOneHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
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
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityMemberKickRequestApproval.Socialinvesting_Social_GetKickRequest,
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
            base_url + `/socialinvesting/api/v1/social/update-kick-request?channel_id=${channel_id}`,
        ]

        const Socialinvesting_Social_UpdateKickRequest_Payload = JSON.stringify({
            community_ids: [],
            request_approval: false
        });

        const stepTwoHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], Socialinvesting_Social_UpdateKickRequest_Payload, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityMemberKickRequestApproval.Socialinvesting_Social_UpdateKickRequest,
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
            base_url + `/socialinvesting/api/v1/social/remove-by-admin?channel_id=${channel_id}`,
        ]

        const Socialinvesting_Social_RemoveByAdmin_Payload = JSON.stringify({
            community_ids: []
        });

        const stepThreeHeaders = {
            // 'Cookie': `ACCESS_TOKEN=${token}`,
            // 'Content-Type': 'application/json',

            'Cookie': `ACCESS_TOKEN=${token}`,
            'Content-Type': 'application/json',
            'Accept-Language':'en',
            'Connection':'keep-alive',
            'Accept-Encoding':'gzip, deflate, br',
            'Accept':'*/*',
        };

        const requests = [
            ['POST', urls[0], Socialinvesting_Social_RemoveByAdmin_Payload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityMemberKickRequestApproval.Socialinvesting_Social_RemoveByAdmin,
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