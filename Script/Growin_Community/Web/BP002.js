import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';

// /socialinvesting/api/v1/channel/joined-by-user
// https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/read?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq
// https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/pinned_messages?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22limit%22%3A1%2C%22sort%22%3A%5B%7B%22field%22%3A%22pinned_at%22%2C%22direction%22%3A-1%7D%5D%7D
// https://chat.stream-io-api.com/members?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22type%22%3A%22messaging%22%2C%22id%22%3A%22f3dbab75-573d-49d2-a573-78b244d39b8a%22%2C%22sort%22%3A%5B%5D%2C%22filter_conditions%22%3A%7B%22name%22%3A%7B%22%24autocomplete%22%3A%22prim%22%7D%7D%7D"

// Socialinvesting_Channel_JoinedByUser
// ChatStreamIoApi_Channels_Messaging_1
// ChatStreamIoApi_Channels_Messaging_2
// ChatStreamIoApi_Members

// Define custom metrics
const ChatRoom = {
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_002_01_01_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_002_01_01_Socialinvesting_Channel_JoinedByUser"),
    },
    ChatStreamIoApi_Channels_Messaging_1: {
        errorCount: new Counter("error_count_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        errorRate: new Rate("error_rate_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpDuration: new Trend("duration_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        httpWaiting: new Trend("waiting_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        requestRate: new Counter("rps_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
        http_reqs: new Counter("sample_002_01_02_ChatStreamIoApi_Channels_Messaging_1"),
    },
    ChatStreamIoApi_Channels_Messaging_2: {
        errorCount: new Counter("error_count_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        errorRate: new Rate("error_rate_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpDuration: new Trend("duration_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        httpWaiting: new Trend("waiting_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        requestRate: new Counter("rps_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
        http_reqs: new Counter("sample_002_01_03_ChatStreamIoApi_Channels_Messaging_2"),
    },
    ChatStreamIoApi_Members: {
        errorCount: new Counter("error_count_004_01_04_ChatStreamIoApi_Members"),
        errorRate: new Rate("error_rate_004_01_04_ChatStreamIoApi_Members"),
        httpDuration: new Trend("duration_004_01_04_ChatStreamIoApi_Members"),
        httpWaiting: new Trend("waiting_004_01_04_ChatStreamIoApi_Members"),
        requestRate: new Counter("rps_004_01_04_ChatStreamIoApi_Members"),
        http_reqs: new Counter("sample_004_01_04_ChatStreamIoApi_Members"),
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
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
            // `https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/read?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq`,
            // `https://chat.stream-io-api.com/channels/messaging/f3dbab75-573d-49d2-a573-78b244d39b8a/pinned_messages?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22limit%22%3A1%2C%22sort%22%3A%5B%7B%22field%22%3A%22pinned_at%22%2C%22direction%22%3A-1%7D%5D%7D`,
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
                ChatRoom.Socialinvesting_Channel_JoinedByUser,
                // ChatRoom.ChatStreamIoApi_Channels_Messaging_1,
                // ChatRoom.ChatStreamIoApi_Channels_Messaging_2,
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

    // // Batch 2
    // if (token) {
    //     const urls = [
    //         `https://chat.stream-io-api.com/members?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq&payload=%7B%22type%22%3A%22messaging%22%2C%22id%22%3A%22f3dbab75-573d-49d2-a573-78b244d39b8a%22%2C%22sort%22%3A%5B%5D%2C%22filter_conditions%22%3A%7B%22name%22%3A%7B%22%24autocomplete%22%3A%22prim%22%7D%7D%7D"`
    //     ];

    //     const stepTwoHeaders = {
    //         // 'Cookie': `ACCESS_TOKEN=${token}`,
    //         // 'Content-Type': 'application/json',

    //         'Cookie': `ACCESS_TOKEN=${token}`,
    //         'Content-Type': 'application/json',
    //         'Accept-Language':'en',
    //         'Connection':'keep-alive',
    //         'Accept-Encoding':'gzip, deflate, br',
    //         'Accept':'*/*',
    //     };

    //     const requests = [
    //         ['GET', urls[0], null, { headers: stepTwoHeaders }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             ChatRoom.ChatStreamIoApi_Members,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
    //             }
    //         }
    //     });
    // }   
    sleep(0.5);
}