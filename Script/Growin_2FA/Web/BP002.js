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
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    Auth_Protected_Otp_Status: {
        errorCount: new Counter("error_count_002_01_02_Auth_Protected_Otp_Status"),
        errorRate: new Rate("error_rate_002_01_02_Auth_Protected_Otp_Status"),
        httpDuration: new Trend("duration_002_01_02_Auth_Protected_Otp_Status"),
        httpWaiting: new Trend("waiting_002_01_02_Auth_Protected_Otp_Status"),
        requestRate: new Counter("rps_002_01_02_Auth_Protected_Otp_Status"),
        http_reqs: new Counter("sample_002_01_02_Auth_Protected_Otp_Status"),
    },
    Auth_Protected_Otp_Request: {
        errorCount: new Counter("error_count_002_01_03_Auth_Protected_Otp_Request"),
        errorRate: new Rate("error_rate_002_01_03_Auth_Protected_Otp_Request"),
        httpDuration: new Trend("duration_002_01_03_Auth_Protected_Otp_Request"),
        httpWaiting: new Trend("waiting_002_01_03_Auth_Protected_Otp_Request"),
        requestRate: new Counter("rps_002_01_03_Auth_Protected_Otp_Request"),
        http_reqs: new Counter("sample_002_01_03_Auth_Protected_Otp_Request"),
    },
    Auth_Protected_Otp_Validate: {
        errorCount: new Counter("error_count_002_01_04_Auth_Protected_Otp_Validate"),
        errorRate: new Rate("error_rate_002_01_04_Auth_Protected_Otp_Validate"),
        httpDuration: new Trend("duration_002_01_04_Auth_Protected_Otp_Validate"),
        httpWaiting: new Trend("waiting_002_01_04_Auth_Protected_Otp_Validate"),
        requestRate: new Counter("rps_002_01_04_Auth_Protected_Otp_Validate"),
        http_reqs: new Counter("sample_002_01_04_Auth_Protected_Otp_Validate"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP002(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST${runTimestamp}_${vuId}_${iterationId}`;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    const userKey = mapping.userKey;
    const credentials = getUserCredentials(userKey, 0);
    const userToken = data.tokens[userKey];
    
    // ✅ Get token dari setup atau lakukan fresh login
    let token = userToken?.token || null;
    
    // ✅ Jika tidak ada token, lakukan login
    if (!token) {
        const urls = [
            base_url + `/auth/api/v1/login`,
        ];

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

        // console.log(`X-Device-Id: ${deviceId}`)

        const requests = [
            ['POST', urls[0], loginPayload, { headers: loginHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerifyPage.Auth_Login,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {

                try {
                    token = response.json().data.token;
                    // console.log(`✅ ${credentials.email} login successful. Body Token Status: ${loginRes.body}`);
                } catch (e) {
                    console.error(`❌ ${credentials.email} failed to parse login response: ${e}`);
                    return; // ✅ Exit jika parsing gagal
                }

                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${credentials.email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
                    console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/status`,
        ];

        const stepOneHeaders = {
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

        const requests = [
            ['GET', urls[0], null, { headers: stepOneHeaders }],
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
                    console.log(`${credentials.email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
                    console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
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
                    console.log(`${credentials.email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
                    console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
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
                    console.log(`${credentials.email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
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
                    console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }   
    sleep(0.25);
}