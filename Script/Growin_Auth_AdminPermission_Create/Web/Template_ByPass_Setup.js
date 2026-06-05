import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /auth/api/v1/login
// /auth/api/v1/protected/otp/status

// /auth/api/v1/protected/otp/status
// /auth/api/v1/protected/otp/request?channel=email
// /auth/api/v1/protected/otp/validate

// Auth_Login
// Auth_Protected_Otp_Status

// Auth_Protected_Otp_Status
// Auth_Protected_Otp_Request
// Auth_Protected_Otp_Validate

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
}

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

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();

    const deviceId = `TEST_${vuId}`;  // ✅ konsisten per-VU — server tidak anggap device baru tiap iterasi

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

    const pin_token = userToken.pin_token;
    const user_id = userToken.user_id;
    const client_id = userToken.client_id;
    const SID = userToken.SID;
    const ksei_acc_no = userToken.ksei_acc_no;
    const account_name = userToken.account_name;
    const email = userToken.email;
    const bp = mapping.bp;

    // ✅ Batch 1: Login
    let sessionToken = null;
    {
        const urls = [
            base_url + `/auth/api/v1/login`,
        ];

        const Auth_Login_Payload = JSON.stringify({
            email: email,
            password: "M@nsek.123",
            recaptcha: '',
        });

        const Auth_Login_Headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            // 'X-Device-Id': 'TEST3',
            'X-Device-Id': deviceId,
            "priority": "u=1, i",
            "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
        };

        const requests = [
            ['POST', urls[0], Auth_Login_Payload, { headers: Auth_Login_Headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Login,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            if (response.status === 200) {
                // console.log(response.body)
                metric.errorRate.add(false);
                metric.errorCount.add(0);
                metric.requestRate.add(true);
                metric.http_reqs.add(1);

                // Ekstrak token dari response login
                try {
                    const body = JSON.parse(response.body);
                    sessionToken = body?.data?.token ?? null;
                    if (!sessionToken) {
                        console.error(`❌ VU${vuId} (${email}) - Login OK tapi token tidak ditemukan di response`);
                    }
                } catch (e) {
                    console.error(`❌ VU${vuId} (${email}) - Gagal parse login response: ${e}`);
                }

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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // ✅ Guard: stop jika login gagal dapat token
    if (!sessionToken) {
        console.error(`❌ VU${vuId} (${email}) - sessionToken null, skip batch selanjutnya`);
        sleep(0.25);
        return;
    }

    // Headers pakai sessionToken hasil login, bukan token dari setup
    const headers = {
        'Cookie': `ACCESS_TOKEN=${sessionToken};`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        // 'X-Device-Id': 'TEST3',
        'X-Device-Id': deviceId,
        "priority": "u=1, i",
        "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
    };

    // Batch 2: OTP Status (Home Page)
    {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/status`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Home.Auth_Protected_Otp_Status,
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 3: VerifyPage — OTP Status + OTP Request
    {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/status`,
            base_url + `/auth/api/v1/protected/otp/request?channel=email`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headers }],
            ['POST', urls[1], null, { headers: headers }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerifyPage.Auth_Protected_Otp_Status,
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    // Batch 4: VerifyPage — OTP Validate
    {
        const urls = [
            base_url + `/auth/api/v1/protected/otp/validate`,
        ];

        const Auth_Protected_Otp_Validate_Payload = JSON.stringify({ 
            otp: "123321",
        });

        const requests = [
            ['POST', urls[0], Auth_Protected_Otp_Validate_Payload, { headers: headers }],
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
                    const timestamp = new Date().toISOString();
                    console.error(`[${timestamp}] ${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
                }
            }
        });
    }

    sleep(0.25);
}