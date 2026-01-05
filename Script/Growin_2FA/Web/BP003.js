import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
// import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /auth/api/v1/protected/verified-device/list
// /auth/api/v1/protected/verified-device/:id

// Auth_Protected_VerifiedDevice_List
// Auth_Protected_VerifiedDevice

// Define custom metrics
const DeviceManagement = {
    Auth_Protected_VerifiedDevice_List: {
        errorCount: new Counter("error_count_003_01_01_Auth_Protected_VerifiedDevice_List"),
        errorRate: new Rate("error_rate_003_01_01_Auth_Protected_VerifiedDevice_List"),
        httpDuration: new Trend("duration_003_01_01_Auth_Protected_VerifiedDevice_List"),
        httpWaiting: new Trend("waiting_003_01_01_Auth_Protected_VerifiedDevice_List"),
        requestRate: new Counter("rps_003_01_01_Auth_Protected_VerifiedDevice_List"),
        http_reqs: new Counter("sample_003_01_01_Auth_Protected_VerifiedDevice_List"),
    },
    Auth_Protected_VerifiedDevice: {
        errorCount: new Counter("error_count_003_01_02_Auth_Protected_VerifiedDevice"),
        errorRate: new Rate("error_rate_003_01_02_Auth_Protected_VerifiedDevice"),
        httpDuration: new Trend("duration_003_01_02_Auth_Protected_VerifiedDevice"),
        httpWaiting: new Trend("waiting_003_01_02_Auth_Protected_VerifiedDevice"),
        requestRate: new Counter("rps_003_01_02_Auth_Protected_VerifiedDevice"),
        http_reqs: new Counter("sample_003_01_02_Auth_Protected_VerifiedDevice"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP003(data) {
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
            base_url + `/auth/api/v1/protected/verified-device/list`,
        ]

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
                DeviceManagement.Auth_Protected_VerifiedDevice_List,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    
    // Batch 2
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/verified-device/${id}`,
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
            ['DELETE', urls[0], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                DeviceManagement.Auth_Protected_VerifiedDevice,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'TEST') {
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
                if (`${__ENV.ENV}` != 'TEST') {
                    const requestBody = requests[index][2];
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.25);
}