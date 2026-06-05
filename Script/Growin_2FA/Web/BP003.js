import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getBaseUrl, getUserCredentials, getDefaultHeaders, MAX_RETRY_ATTEMPTS, RETRY_DELAY, BATCH_SIZE, BATCH_DELAY } from '../../../Helper/config.js';

// Define custom metrics
const Home = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    Auth_Protected_Otp_Status: {
        errorCount: new Counter("error_count_001_01_02_Auth_Protected_Otp_Status"),
        errorRate: new Rate("error_rate_001_01_02_Auth_Protected_Otp_Status"),
        httpDuration: new Trend("duration_001_01_02_Auth_Protected_Otp_Status"),
        httpWaiting: new Trend("waiting_001_01_02_Auth_Protected_Otp_Status"),
        requestRate: new Counter("rps_001_01_02_Auth_Protected_Otp_Status"),
        http_reqs: new Counter("sample_001_01_02_Auth_Protected_Otp_Status"),
    },
};

const VerifyPage = {
    Auth_Protected_Otp_Status: {
        errorCount: new Counter("error_count_001_02_01_Auth_Protected_Otp_Status"),
        errorRate: new Rate("error_rate_001_02_01_Auth_Protected_Otp_Status"),
        httpDuration: new Trend("duration_001_02_01_Auth_Protected_Otp_Status"),
        httpWaiting: new Trend("waiting_001_02_01_Auth_Protected_Otp_Status"),
        requestRate: new Counter("rps_001_02_01_Auth_Protected_Otp_Status"),
        http_reqs: new Counter("sample_001_02_01_Auth_Protected_Otp_Status"),
    },
    Auth_Protected_Otp_Request: {
        errorCount: new Counter("error_count_001_02_02_Auth_Protected_Otp_Request"),
        errorRate: new Rate("error_rate_001_02_02_Auth_Protected_Otp_Request"),
        httpDuration: new Trend("duration_001_02_02_Auth_Protected_Otp_Request"),
        httpWaiting: new Trend("waiting_001_02_02_Auth_Protected_Otp_Request"),
        requestRate: new Counter("rps_001_02_02_Auth_Protected_Otp_Request"),
        http_reqs: new Counter("sample_001_02_02_Auth_Protected_Otp_Request"),
    },
    Auth_Protected_Otp_Validate: {
        errorCount: new Counter("error_count_001_02_03_Auth_Protected_Otp_Validate"),
        errorRate: new Rate("error_rate_001_02_03_Auth_Protected_Otp_Validate"),
        httpDuration: new Trend("duration_001_02_03_Auth_Protected_Otp_Validate"),
        httpWaiting: new Trend("waiting_001_02_03_Auth_Protected_Otp_Validate"),
        requestRate: new Counter("rps_001_02_03_Auth_Protected_Otp_Validate"),
        http_reqs: new Counter("sample_001_02_03_Auth_Protected_Otp_Validate"),
    },
};

const DeviceManagement = {
    Auth_Protected_VerifiedDevice_List: {
        errorCount: new Counter("error_count_002_01_01_Auth_Protected_VerifiedDevice_List"),
        errorRate: new Rate("error_rate_002_01_01_Auth_Protected_VerifiedDevice_List"),
        httpDuration: new Trend("duration_002_01_01_Auth_Protected_VerifiedDevice_List"),
        httpWaiting: new Trend("waiting_002_01_01_Auth_Protected_VerifiedDevice_List"),
        requestRate: new Counter("rps_002_01_01_Auth_Protected_VerifiedDevice_List"),
        http_reqs: new Counter("sample_002_01_01_Auth_Protected_VerifiedDevice_List"),
    },
    Auth_Protected_VerifiedDevice_ID: {
        errorCount: new Counter("error_count_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
        errorRate: new Rate("error_rate_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
        httpDuration: new Trend("duration_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
        httpWaiting: new Trend("waiting_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
        requestRate: new Counter("rps_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
        http_reqs: new Counter("sample_002_01_02_Auth_Protected_VerifiedDevice_Delete"),
    },
};

export function BP003(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();

    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;

    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }

    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];

    if (!userToken) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No token data available, skipping iteration`);
        return;
    }

    const setup_pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;

    // ─── Login (OTP Flow) ─────────────────────────────────────────────────────
    let token = null;
    {
        const url = base_url + `/auth/api/v1/login`;

        const loginPayload = JSON.stringify({
            email: email,
            password: "M@nsek.123",
            recaptcha: '',
        });

        const loginHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': deviceId,
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        };

        const requests = [['POST', url, loginPayload, { headers: loginHeaders }]];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metric = Home.Auth_Login;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                try {
                    token = response.json().data.token;
                } catch (e) {
                    console.error(`❌ VU${vuId} (${email}) - Gagal parse login response: ${e}`);
                }
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`[${new Date().toISOString()}] ${email} ERROR ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            }
        });
    }

    // ─── Batch 1: OTP Status (Home Page) ──────────────────────────────────────
    let batch1 = null;
    if (token) {
        const url = base_url + `/auth/api/v1/protected/otp/status`;

        const otpStatusHeaders = {
            'Cookie': `ACCESS_TOKEN=${token};`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': deviceId,
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        };

        const requests = [['GET', url, null, { headers: otpStatusHeaders }]];
        const responses = http.batch(requests);

        responses.forEach((response) => {
            const metric = Home.Auth_Protected_Otp_Status;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                batch1 = response.status;
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`[${new Date().toISOString()}] ${email} ERROR ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            }
        });
    }

    // ─── Batch 2: OTP Request ─────────────────────────────────────────────────
    let batch2 = null;
    if (batch1 === 200) {
        const url = base_url + `/auth/api/v1/protected/otp/request?channel=email`;

        const otpRequestHeaders = {
            'Cookie': `ACCESS_TOKEN=${token};`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': deviceId,
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        };

        const requests = [['POST', url, null, { headers: otpRequestHeaders }]];
        const responses = http.batch(requests);

        responses.forEach((response) => {
            const metric = VerifyPage.Auth_Protected_Otp_Request;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                batch2 = response.status;
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`[${new Date().toISOString()}] ${email} ERROR ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            }
        });
    }

    // ─── Batch 3: OTP Validate ────────────────────────────────────────────────
    let batch3 = null;
    if (batch2 === 200) {
        const url = base_url + `/auth/api/v1/protected/otp/validate`;

        const otpValidatePayload = JSON.stringify({ otp: "123321" });

        const otpValidateHeaders = {
            'Cookie': `ACCESS_TOKEN=${token};`,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': deviceId,
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        };

        const requests = [['POST', url, otpValidatePayload, { headers: otpValidateHeaders }]];
        const responses = http.batch(requests);

        responses.forEach((response) => {
            const metric = VerifyPage.Auth_Protected_Otp_Validate;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                batch3 = response.status;
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`[${new Date().toISOString()}] ${email} ERROR ${url} || Status: ${response.status} || Body: ${response.body}`);
                }
            }
        });
    }
    sleep(0.25);

    // ─── Login kedua dengan TEST3 — untuk device management ───────────────────
    let test3Token = null;
    let test3PinToken = null;
    {
        const loginUrl = base_url + `/auth/api/v1/login`;

        const loginPayloadTest3 = JSON.stringify({
            email: email,
            password: "M@nsek.123",
            recaptcha: '',
        });

        const loginHeadersTest3 = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3',
        };

        const loginRes = http.post(loginUrl, loginPayloadTest3, { headers: loginHeadersTest3 });

        if (loginRes.status === 200) {
            try {
                test3Token = loginRes.json().data.token;

                const pinPayload = JSON.stringify({ value: "123456" });
                const pinHeaders = {
                    'Cookie': `ACCESS_TOKEN=${test3Token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Accept-Language': 'en',
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
                    'X-App-Name': 'web',
                    'X-App-Version': '1.4.1',
                    'X-Device-Info': 'iPhone 11',
                    'X-Device-Id': 'TEST3',
                };

                const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

                if (pinRes.status === 200) {
                    test3PinToken = pinRes.json().data.pin_token;
                } else {
                    console.error(`${email} ❌ PIN login failed for TEST3 - Status: ${pinRes.status} - Body: ${pinRes.body}`);
                }
            } catch (e) {
                console.error(`${email} ❌ Failed to parse TEST3 login response: ${e}`);
            }
        } else {
            console.error(`${email} ❌ Login failed for TEST3 - Status: ${loginRes.status} - Body: ${loginRes.body}`);
        }
    }

    // if (!test3Token || !test3PinToken) {
    //     console.error(`${email} ❌ Cannot proceed with device management - missing tokens`);
    //     sleep(0.25);
    //     return;
    // }

    const deviceMgmtHeaders = {
        'Cookie': `ACCESS_TOKEN=${test3Token}; PIN_ACCESS_TOKEN=${test3PinToken}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };

    // ─── Device List ──────────────────────────────────────────────────────────
    let deviceIdToDelete = null;
    {
        const url = base_url + `/auth/api/v1/protected/verified-device/list`;
        const requests = [['GET', url, null, { headers: deviceMgmtHeaders }]];
        const responses = http.batch(requests);

        responses.forEach((response) => {
            const metric = DeviceManagement.Auth_Protected_VerifiedDevice_List;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                try {
                    const responseData = response.json();
                    if (responseData?.data?.data && Array.isArray(responseData.data.data) && responseData.data.data.length > 0) {
                        const allIds = responseData.data.data.map(item => item.id);
                        deviceIdToDelete = allIds[4];
                    }
                } catch (e) {
                    console.error(`${email} ❌ Failed to parse device list: ${e.message}`);
                }
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${url} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }

    // ─── Delete Device ────────────────────────────────────────────────────────
    if (deviceIdToDelete) {
        const url = base_url + `/auth/api/v1/protected/verified-device/${deviceIdToDelete}`;
        const deleteRequests = [['DELETE', url, null, { headers: deviceMgmtHeaders }]];
        const deleteResponses = http.batch(deleteRequests);

        deleteResponses.forEach((response) => {
            const metric = DeviceManagement.Auth_Protected_VerifiedDevice_ID;
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${url} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                check(response, {
                    [`ERROR ${url} || Status: ${response.status}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${url} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }
    sleep(0.25);
}