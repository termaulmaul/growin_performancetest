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
        errorCount: new Counter("error_count_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
        errorRate: new Rate("error_rate_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
        httpDuration: new Trend("duration_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
        httpWaiting: new Trend("waiting_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
        requestRate: new Counter("rps_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
        http_reqs: new Counter("sample_003_01_02_Auth_Protected_VerifiedDevice_Delete"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP004(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    const mapping = data.vuMapping[vuId];
    
    const userKey = mapping.userKey;
    const credentials = getUserCredentials(userKey, 0);
    const userToken = data.tokens[userKey];
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    const email = userTokenData.email;
    
    let deviceIdToDelete = null;
    
    // ✅ Get token dari setup atau lakukan fresh login
    // let token = userToken?.token || null;
    let token;
    let pinToken;
    
    // ✅ Jika tidak ada token, lakukan login
    // if (!token) {
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
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
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
                    // console.log(`✅ ${credentials.email} login successful. Body Token Status: ${response.body}`);
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
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    // }

    // Batch 1
    let batch1;
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

            'Cookie': `ACCESS_TOKEN=${token};`,
            'Accept-Language': 'en',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
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
                batch1 = response.status;
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
                    // [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Email : ${credentials.email} || Device ID : ${deviceId}`]: (r) => r.status === 200
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 2
    let batch2;
    if (batch1 == 200) {
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

            'Cookie': `ACCESS_TOKEN=${token};`,
            'Accept-Language': 'en',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
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
                batch2 = response.status;
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
                    // [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Email : ${credentials.email} || Device ID : ${deviceId}`]: (r) => r.status === 200
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }   

    // Batch 3
    let batch3;
    if (batch2 == 200) {
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

            'Cookie': `ACCESS_TOKEN=${token};`,
            'Accept-Language': 'en',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
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
                batch3 = response.status;
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
                    // [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Email : ${credentials.email} || Device ID : ${deviceId}`]: (r) => r.status === 200
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }   
    sleep(0.5);

    // if (!token) {
        // Login with TEST3 device to get pin_token for device management operations
        const loginUrl = base_url + `/auth/api/v1/login`;

        const loginPayloadTest3 = JSON.stringify({
            password: credentials.password,
            email: credentials.email,
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

        const loginRequestTest3 = [
            ['POST', loginUrl, loginPayloadTest3, { headers: loginHeadersTest3 }],
        ];

        const loginResponseTest3 = http.batch(loginRequestTest3);
        const loginRes = loginResponseTest3[0];

        let test3Token = null;
        let test3PinToken = null;

        if (loginRes.status === 200) {
            try {
                test3Token = loginRes.json().data.token;
                // console.log(`Body: ${loginRes.body}`)
                
                // Get PIN token
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
                    'X-Device-Id': 'TEST3'
                };

                const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

                if (pinRes.status === 200) {
                    test3PinToken = pinRes.json().data.pin_token;
                    // console.log(`test3PinToken: ${test3PinToken}`)
                } else {
                    console.error(`${email} ❌ PIN login failed for TEST3 device - Status: ${pinRes.status} - Body: ${pinRes.body}`);
                }
                
            } catch (e) {
                console.error(`${email} ❌ Failed to parse TEST3 login response: ${e}`);
            }
        } else {
            console.error(`${email} ❌ Login failed for TEST3 device - Status: ${loginRes.status} - Body: ${loginRes.body}`);
        }

        // Only proceed with device management if we have both tokens
        if (!test3Token || !test3PinToken) {
            console.error(`${email} ❌ Cannot proceed with device management - missing tokens`);
            return;
        }
    // }

    // Batch 1 - Get device list
    if (test3Token) {
        const urls = [
            base_url + `/auth/api/v1/protected/verified-device/list`,
        ];

        const stepOnePointTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${test3Token}; PIN_ACCESS_TOKEN=${test3PinToken}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3',
            // 'X-Device-Id': deviceId,
        };

        const requests = [
            ['GET', urls[0], null, { headers: stepOnePointTwoHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                DeviceManagement.Auth_Protected_VerifiedDevice_List,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
                try {
                    const responseData = response.json();
                    
                    if (responseData?.data?.data && Array.isArray(responseData.data.data) && responseData.data.data.length > 0) {
                        const allDevices = responseData.data.data;
                        const allIds = allDevices.map(item => item.id);
                        
                        // deviceIdToDelete = allIds[1] || allIds[0]; // Fallback to first if only one device
                        deviceIdToDelete = allIds[4]; // Fallback to first if only one device
                    }
                } catch (e) {
                    console.error(`${email} ❌ Failed to parse device list: ${e.message}`);
                }

                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Email : ${credentials.email} || Device ID : ${deviceId}`]: (r) => r.status === 200
                    // [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 2 - Delete device (only if we have a device ID)
    if (deviceIdToDelete) {
        const deleteUrls = [
            base_url + `/auth/api/v1/protected/verified-device/${deviceIdToDelete}`,
        ];

        const stepTwoPointTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${test3Token}; PIN_ACCESS_TOKEN=${test3PinToken}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': '*/*',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3',
            // 'X-Device-Id': deviceId,
        };

        const deleteRequests = [
            ['DELETE', deleteUrls[0], null, { headers: stepTwoPointTwoHeaders }],
        ];
        const deleteResponses = http.batch(deleteRequests);

        deleteResponses.forEach((response, index) => {
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
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.log(`${email} ${deleteUrls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            } else {
                metric.errorRate.add(true);
                metric.errorCount.add(1);
                metric.requestRate.add(false);
                metric.http_reqs.add(1);
                
                check(response, {
                    // [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body} || Email : ${credentials.email} || Device ID : ${deviceId}`]: (r) => r.status === 200
                    [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
                });
                if (`${__ENV.ENV}` != 'INT') {
                    const requestBody = requests[index][2];
                    // console.error(`${credentials.email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }
    sleep(0.5);
}