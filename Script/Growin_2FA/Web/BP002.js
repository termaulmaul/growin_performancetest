import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
// import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /auth/api/v1/protected/otp/status
// /auth/api/v1/protected/otp/request?channel=email
// /auth/api/v1/protected/otp/validate

// Auth_Protected_Otp_Status
// Auth_Protected_Otp_Request
// Auth_Protected_Otp_Validate

// Define custom metrics
const VerifyPage = {
    Auth_Protected_Otp_Status: {
        errorCount: new Counter("error_count_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_002_01_01_Socialinvesting_Channel_JoinedByUser"),
    },
    Auth_Protected_Otp_Request: {
        errorCount: new Counter("error_count_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        errorRate: new Rate("error_rate_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpDuration: new Trend("duration_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpWaiting: new Trend("waiting_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        requestRate: new Counter("rps_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        http_reqs: new Counter("sample_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
    },
    Auth_Protected_Otp_Validate: {
        errorCount: new Counter("error_count_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        errorRate: new Rate("error_rate_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpDuration: new Trend("duration_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpWaiting: new Trend("waiting_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        requestRate: new Counter("rps_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        http_reqs: new Counter("sample_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP002(data) {
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

    // const channel_id = getChannelId(base_url, token, bp, isIntEnv);

    // Final safety check sebelum melanjutkan ke API calls
    // if (!channel_id) {
    //     console.error(`   ❌ ${email} - Still no channel_id after all fallbacks, aborting iteration`);
    //     // SystemMetrics.noChannelFound.add(1);
    //     return;
    // }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/status`,
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
            // ['GET', urls[1], null, { headers: stepOneHeaders }],
            // ['GET', urls[2], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerifyPage.Auth_Protected_Otp_Status,
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
            base_url + `/auth/api/v1/protected/otp/request?channel=${email}`,
        ];

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
            ['POST', urls[0], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerifyPage.Auth_Protected_Otp_Request,
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
            base_url + `/auth/api/v1/protected/otp/validate`,
        ];

        const Auth_Protected_Otp_Request_Payload = JSON.stringify({ 
            otp: "123456",
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
            ['POST', urls[0], Auth_Protected_Otp_Request_Payload, { headers: stepThreeHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerifyPage.Auth_Protected_Otp_Validate,
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
    sleep(0.25);
}