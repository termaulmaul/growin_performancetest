import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}
// /socialinvesting/api/v1/community-profile/get-profile
// /socialinvesting/api/v1/channel/joined-by-user

// Socialinvesting_Channel_GetProfile
// Socialinvesting_CommunityProfile_GetProfile
// Socialinvesting_Channel_JoinedByUser

// Define custom metrics
const CommunityDetailUser = {
    Socialinvesting_Channel_GetProfile: {
        errorCount: new Counter("error_count_007_01_01_Socialinvesting_Channel_GetProfile"),
        errorRate: new Rate("error_rate_007_01_01_Socialinvesting_Channel_GetProfile"),
        httpDuration: new Trend("duration_007_01_01_Socialinvesting_Channel_GetProfile"),
        httpWaiting: new Trend("waiting_007_01_01_Socialinvesting_Channel_GetProfile"),
        requestRate: new Counter("rps_007_01_01_Socialinvesting_Channel_GetProfile"),
        http_reqs: new Counter("sample_007_01_01_Socialinvesting_Channel_GetProfile"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_007_01_02_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_007_01_03_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_007_01_03_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_007_01_03_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_007_01_03_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_007_01_03_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_007_01_03_Socialinvesting_Channel_JoinedByUser"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP007(data) {
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
            base_url + `/socialinvesting/api/v1/channel/get-profile?channel_id=${channel_id}`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
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
            ['GET', urls[1], null, { headers: stepOneHeaders }],
            ['GET', urls[2], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                CommunityDetailUser.Socialinvesting_Channel_GetProfile,
                CommunityDetailUser.Socialinvesting_CommunityProfile_GetProfile,
                CommunityDetailUser.Socialinvesting_Channel_JoinedByUser,
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