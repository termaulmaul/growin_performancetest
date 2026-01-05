import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
// import { getChannelId, getChannelIdWithOptions, ChannelMetrics } from './channelIDHelper.js';
import { getUserCredentials } from './Growin_2FA_LoadTest.js';  // ✅ Import function

// /auth/api/v1/login

// Auth_Login

// Define custom metrics
const Login_OTP = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
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
    
    // ✅ Generate credentials langsung di sini menggunakan userKey
    // userKey adalah globalUserOffset + localUserIndex dari setup
    // Kita perlu extract nomor user yang sesuai
    const credentials = getUserCredentials(userKey, 0);
    const email = credentials.email;
    const password = credentials.password;
    
    console.log(`🔑 VU${vuId} using email: ${email}`);
    
    const urls = [
        base_url + `/auth/api/v1/login`,
    ];

    const AuthLoginPayload = JSON.stringify({ 
        email: email,           // ✅ Email generated from getUserCredentials
        password: password,     // ✅ Password from getUserCredentials
        recaptcha: ""
    });

    const stepOneHeaders = {
        // 'Cookie': `ACCESS_TOKEN=${token}`,
        // 'Content-Type': 'application/json',

        // 'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const requests = [
        ['POST', urls[0], AuthLoginPayload, { headers: stepOneHeaders }],
    ];
    const responses = http.batch(requests);

    responses.forEach((response, index) => {
        const metrics = [
            Login_OTP.Auth_Login,
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
    sleep(0.25);
}