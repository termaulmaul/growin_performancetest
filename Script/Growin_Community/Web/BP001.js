import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /socialinvesting/api/v2/community-profile/login
// /socialinvesting/api/v1/channel/joined-by-user
// /socialinvesting/api/v1/community-profile/get-profile
// /socialinvesting/api/v1/channel/get-list
// https://chat.stream-io-api.com/channels?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq
// wss://chat.stream-io-api.com/connect?json=%7B%22user_id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22user_details%22%3A%7B%22id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22image%22%3A%22%22%7D%2C%22client_request_id%22%3A%22d737b9de-8e5f-44ff-9aa0-fbad45787d55%22%7D&api_key=nnp9r257yfpq&authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzI2MjJkMjctOGQ3Yy00YTk2LWIyZGUtOWVjY2VmY2NlOWNlIn0.gruehExQyq23gJZh9bn9yKwqbNwe2wD7RgjOluBAGx0&stream-auth-type=jwt&X-Stream-Client=stream-chat-js-v8.60.0-browser

// Socialinvesting_CommunityProfile_Login
// Socialinvesting_Channel_JoinedByUser
// Socialinvesting_CommunityProfile_GetProfile
// Socialinvesting_Channel_GetList
// ChatStreamIoApi_Channels
// ChatStreamIoApi_Connect

// Define custom metrics
const YourCommunities = {
    Socialinvesting_CommunityProfile_Login: {
        errorCount: new Counter("error_count_001_01_01_Socialinvesting_CommunityProfile_Login"),
        errorRate: new Rate("error_rate_001_01_01_Socialinvesting_CommunityProfile_Login"),
        httpDuration: new Trend("duration_001_01_01_Socialinvesting_CommunityProfile_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Socialinvesting_CommunityProfile_Login"),
        requestRate: new Counter("rps_001_01_01_Socialinvesting_CommunityProfile_Login"),
        http_reqs: new Counter("sample_001_01_01_Socialinvesting_CommunityProfile_Login"),
    },
    Socialinvesting_Channel_JoinedByUser: {
        errorCount: new Counter("error_count_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        errorRate: new Rate("error_rate_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        httpDuration: new Trend("duration_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        httpWaiting: new Trend("waiting_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        requestRate: new Counter("rps_001_01_02_Socialinvesting_Channel_JoinedByUser"),
        http_reqs: new Counter("sample_001_01_02_Socialinvesting_Channel_JoinedByUser"),
    },
    Socialinvesting_CommunityProfile_GetProfile: {
        errorCount: new Counter("error_count_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        errorRate: new Rate("error_rate_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpDuration: new Trend("duration_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        httpWaiting: new Trend("waiting_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        requestRate: new Counter("rps_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
        http_reqs: new Counter("sample_001_01_03_Socialinvesting_CommunityProfile_GetProfile"),
    },
    Socialinvesting_Channel_GetList: {
        errorCount: new Counter("error_count_001_02_04_Socialinvesting_Channel_GetList"),
        errorRate: new Rate("error_rate_001_02_04_Socialinvesting_Channel_GetList"),
        httpDuration: new Trend("duration_001_02_04_Socialinvesting_Channel_GetList"),
        httpWaiting: new Trend("waiting_001_02_04_Socialinvesting_Channel_GetList"),
        requestRate: new Counter("rps_001_02_04_Socialinvesting_Channel_GetList"),
        http_reqs: new Counter("sample_001_02_04_Socialinvesting_Channel_GetList"),
    },
    ChatStreamIoApi_Channels: {
        errorCount: new Counter("error_count_001_02_05_ChatStreamIoApi_Channels"),
        errorRate: new Rate("error_rate_001_02_05_ChatStreamIoApi_Channels"),
        httpDuration: new Trend("duration_001_02_05_ChatStreamIoApi_Channels"),
        httpWaiting: new Trend("waiting_001_02_05_ChatStreamIoApi_Channels"),
        requestRate: new Counter("rps_001_02_05_ChatStreamIoApi_Channels"),
        http_reqs: new Counter("sample_001_02_05_ChatStreamIoApi_Channels"),
    },
    ChatStreamIoApi_Connect: {
        errorCount: new Counter("error_count_001_02_06_ChatStreamIoApi_Connect"),
        errorRate: new Rate("error_rate_001_02_06_ChatStreamIoApi_Connect"),
        httpDuration: new Trend("duration_001_02_06_ChatStreamIoApi_Connect"),
        httpWaiting: new Trend("waiting_001_02_06_ChatStreamIoApi_Connect"),
        requestRate: new Counter("rps_001_02_06_ChatStreamIoApi_Connect"),
        http_reqs: new Counter("sample_001_02_06_ChatStreamIoApi_Connect"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP001(data) {
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

    // ✅ Ambil channel_id untuk BP ini dari data yang sudah di-fetch di setup()
    const channel_id = data.channelIds ? data.channelIds[bp] : null;
    
    if (!channel_id) {
        console.error(`❌ ${email} (${bp}) - No channel_id available, skipping iteration`);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v2/community-profile/login`,
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
            ['POST', urls[0], null, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                YourCommunities.Socialinvesting_CommunityProfile_Login,
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
            // base_url + `/socialinvesting/api/v2/community-profile/login`,
            base_url + `/socialinvesting/api/v1/channel/joined-by-user`,
            base_url + `/socialinvesting/api/v1/community-profile/get-profile`,
            base_url + `/socialinvesting/api/v1/channel/get-list`,
            // `https://chat.stream-io-api.com/channels?user_id=32622d27-8d7c-4a96-b2de-9eccefcce9ce&connection_id=68f6f874-0a0b-21f1-0200-0000008adca4&api_key=nnp9r257yfpq`,
            // `wss://chat.stream-io-api.com/connect?json=%7B%22user_id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22user_details%22%3A%7B%22id%22%3A%2232622d27-8d7c-4a96-b2de-9eccefcce9ce%22%2C%22image%22%3A%22%22%7D%2C%22client_request_id%22%3A%22d737b9de-8e5f-44ff-9aa0-fbad45787d55%22%7D&api_key=nnp9r257yfpq&authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMzI2MjJkMjctOGQ3Yy00YTk2LWIyZGUtOWVjY2VmY2NlOWNlIn0.gruehExQyq23gJZh9bn9yKwqbNwe2wD7RgjOluBAGx0&stream-auth-type=jwt&X-Stream-Client=stream-chat-js-v8.60.0-browser`,
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
            ['GET', urls[0], null, { headers: stepTwoHeaders }],
            ['GET', urls[1], null, { headers: stepTwoHeaders }],
            ['GET', urls[2], null, { headers: stepTwoHeaders }],
            // ['GET', urls[3], null, { headers: stepTwoHeaders }],
            // ['GET', urls[4], null, { headers: stepTwoHeaders }],
            // ['GET', urls[5], null, { headers: stepTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                // YourCommunities.Socialinvesting_CommunityProfile_Login,
                YourCommunities.Socialinvesting_Channel_JoinedByUser,
                YourCommunities.Socialinvesting_CommunityProfile_GetProfile,
                YourCommunities.Socialinvesting_Channel_GetList,
                // YourCommunities.ChatStreamIoApi_Channels,
                // YourCommunities.ChatStreamIoApi_Connect,
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