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
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    // ✅ Get mapping from setup
    // const mapping = data.vuMapping[vuId];
    // if (!mapping) {
    //     console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
    //     return;
    // }
    
    const userKey = mapping.userKey;
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    // if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
    //     console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
    //     return;
    // }
    
    // const token = userTokenData.token;
    // const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = {
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
    };

    // Deklarasi token dan pinToken di luar block agar bisa diakses lintas batch
    let token = null;
    let pinToken = null;

    // ─── Batch 1 - Login_Password ──────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v2/admin-login`,
        ];

        const Auth_AdminLogin_Payload = JSON.stringify({
            identity: its_user,
            password: "M@nsek.123",
        });

        const requests = [
            ['POST', urls[0], Auth_AdminLogin_Payload, { headers: headersBeforeLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login_Password.Auth_AdminLogin
            ]

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                try {
                    const body = JSON.parse(response.body);
                    token = body?.data?.token ?? null; // assign ke outer variable
                } catch (e) {
                    console.error(`❌ VU${vuId} - Gagal parse login response: ${e}`);
                }
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

    const headersAfterLogin = {
        'Cookie': `ACCESS_TOKEN=${token}`,
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
    };

    // ─── Batch 2 - Login_PIN ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/protected/admin-pin-login`,
        ];

        const Auth_Protected_AdminPinLogin_Payload = JSON.stringify({
            value: "123456"
        });

        const requests = [
            ['POST', urls[0], Auth_Protected_AdminPinLogin_Payload, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login_PIN.Auth_Protected_AdminPinLogin
            ]
            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);

            if (response.status === 200) {
                try {
                    const body = JSON.parse(response.body);
                    pinToken = body?.data?.pin_token ?? null; // assign ke outer variable
                } catch (e) {
                    console.error(`❌ VU${vuId} - Gagal parse pin login response: ${e}`);
                }
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

    const headersAfterPin = {
        'Cookie': `ACCESS_TOKEN=${token}; PIN_ACCESS_TOKEN=${pinToken}`,
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
    };

    // ─── Batch 3 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/admin/refresh/pass-token`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterPin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Refresh_Token_Pass.Auth_Admin_Refresh_PassToken
            ]

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