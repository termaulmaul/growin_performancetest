import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
import { getUserCredentials } from './Growin_2FA_LoadTest.js';  // ✅ Import function

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
    const iterationId = exec.scenario.iterationInTest;
    
    // ✅ PERBAIKAN: Device ID harus konsisten per VU, bukan per iterasi
    const deviceId = `TEST_VU${vuId}`;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    const userKey = mapping.userKey;
    const credentials = getUserCredentials(userKey, 0);
    
    // ✅ PERBAIKAN: Ambil atau inisialisasi token state untuk user ini
    if (!data.tokens[userKey]) {
        data.tokens[userKey] = { token: null, pin_token: null };
    }
    
    let token = data.tokens[userKey].token;
    let pinToken = data.tokens[userKey].pin_token;
    
    // ✅ Jika tidak ada token, lakukan login + PIN
    if (!token || !pinToken) {
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

        const statusAccount = loginRes.json().data.is_otp_verified;

        if (loginRes.status !== 200 || statusAccount == false ) {
            console.error(`❌ ${credentials.email} login failed: ${loginRes.status} - ${loginRes.body}`);
            return;
        }

        try {
            token = loginRes.json().data.token;
            data.tokens[userKey].token = token;
            // console.log(`✅ ${credentials.email} login successful. Body Token Status: ${loginRes.body}`);
            
            // ✅ PIN Login dengan token yang baru didapat
            const pinPayload = JSON.stringify({ value: "123456" });
            const pinHeaders = {
                'Cookie': `ACCESS_TOKEN=${token}`,
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

            const pinRes = http.post(base_url + '/auth/api/v1/protected/pin-login', pinPayload, { headers: pinHeaders });

            if (pinRes.status === 200) {
                pinToken = pinRes.json().data.pin_token;
                data.tokens[userKey].pin_token = pinToken;
                // console.log(`✅ ${credentials.email} PIN login successful`);
            } else {
                console.error(`❌ ${credentials.email} PIN login failed: ${pinRes.status} - ${pinRes.body}`);
                return;
            }
        } catch (e) {
            console.error(`❌ ${credentials.email} failed to parse response: ${e}`);
            return;
        }
    }

    // ✅ Deklarasi deviceIdToDelete di scope function
    let deviceIdToDelete = null;

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/verified-device/list`,
        ]

        const stepOneHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
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
            'X-Device-Id': deviceId,
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
                // ✅ PERBAIKAN: Hapus variable shadowing
                try {
                    const responseData = response.json();  // ← Langsung gunakan 'response' dari forEach
                    
                    if (responseData?.data?.data && Array.isArray(responseData.data.data) && responseData.data.data.length > 0) {
                        const allDevices = responseData.data.data;
                        const allIds = allDevices.map(item => item.id);
                        
                        // console.log(`${credentials.email} ✅ Found ${allIds.length} devices:`, allIds);
                        
                        deviceIdToDelete = allIds[1];  // ✅ Sekarang variable sudah dideklarasi
                        
                        // console.log(`${credentials.email} ✅ Selected device ID to delete: ${deviceIdToDelete}`);
                    } else {
                        console.error(`${credentials.email} ❌ No devices in response - data array is empty or undefined`);
                    }
                } catch (e) {
                    console.error(`${credentials.email} ❌ Failed to parse device list: ${e.message}`);
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
    
    // Batch 2
    if (token) {
        const urls = [
            base_url + `/auth/api/v1/protected/verified-device/${deviceIdToDelete}`,
        ];

        const stepTwoHeaders = {
            'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
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
            'X-Device-Id': deviceId,
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