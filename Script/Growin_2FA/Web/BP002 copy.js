import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getUserCredentials } from './Growin_2FA_LoadTest.js';  // ✅ Import function
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

    const credentials = getUserCredentials(userKey, 0);
    const email = credentials.email;
    const password = credentials.password;
    
    const userToken = data.tokens[userKey];
    
    // const token = userToken.token;
    let token = "a";
    const pin_token = userToken.pin_token;
    // const email = userToken.email;
    const bp = mapping.bp;
    const isIntEnv = `${__ENV.ENV}` === 'INT';

    if (token) {
        const loginPayload = JSON.stringify({
            password: credentials.password,
            email: credentials.email,
            recaptcha: '',
        });

        const loginHeaders = {
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'PostmanRuntime/7.43.0',

            'Accept-Language': 'en',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3',
        };

        const loginRes = http.post(base_url + '/auth/api/v1/login', loginPayload, { headers: loginHeaders });

        if (loginRes == 200) {
            token = loginRes.json().data.token;
        } else {
            token = ""
        }
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/status`,
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
            'X-Device-Id': 'TEST3'
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
            base_url + `/auth/api/v1/protected/otp/request?channel=email`,
        ];

        const stepTwoHeaders = {
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
            otp: "123321",
        });

        const stepThreeHeaders = {
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