import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Define custom metrics
const Login = {
    Auth_Login: {
        errorCount: new Counter("error_count_001_01_01_Auth_Login"),
        errorRate: new Rate("error_rate_001_01_01_Auth_Login"),
        httpDuration: new Trend("duration_001_01_01_Auth_Login"),
        httpWaiting: new Trend("waiting_001_01_01_Auth_Login"),
        requestRate: new Counter("rps_001_01_01_Auth_Login"),
        http_reqs: new Counter("sample_001_01_01_Auth_Login"),
    },
    Gamification_User_Detail: {
        errorCount: new Counter("error_count_001_01_02_Gamification_User_Detail"),
        errorRate: new Rate("error_rate_001_01_02_Gamification_User_Detail"),
        httpDuration: new Trend("duration_001_01_02_Gamification_User_Detail"),
        httpWaiting: new Trend("waiting_001_01_02_Gamification_User_Detail"),
        requestRate: new Counter("rps_001_01_02_Gamification_User_Detail"),
        http_reqs: new Counter("sample_001_01_02_Gamification_User_Detail"),
    },
};

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    // ✅ Get userKey dari VU mapping
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token available, skipping iteration`);
        return;
    }
    
    const email = userToken.email;

    // Batch 1
    let token;
    const loginUrl = base_url + `/auth/api/v1/login`;

    const authLoginPayload = JSON.stringify({
        password: 'M@nsek.123',
        email: email,
        recaptcha: '',
    });

    const loginHeaders = {
        // 'Content-Type': 'application/json',

        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    // Perform login request
    const loginResponse = http.post(loginUrl, authLoginPayload, { headers: loginHeaders });

    // Process Login metrics
    const loginMetric = Login.Auth_Login;
    loginMetric.httpDuration.add(loginResponse.timings.duration);
    
    if (loginResponse.status === 200) {
        loginMetric.errorRate.add(false);
        loginMetric.errorCount.add(0);
        loginMetric.requestRate.add(true);
        loginMetric.http_reqs.add(1);
        
        // Extract token from response
        try {
            token = loginResponse.json().data.token;
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`VU${vuId} ${email} Login SUCCESS || Status: ${loginResponse.status}`);
            }
        } catch (e) {
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`VU${vuId} ${email} Failed to parse token || Error: ${e.message}`);
            }
        }
    } else {
        loginMetric.errorRate.add(true);
        loginMetric.errorCount.add(1);
        loginMetric.requestRate.add(false);
        loginMetric.http_reqs.add(1);
        check(loginResponse, {
            [`ERROR ${loginUrl} || Status: ${loginResponse.status} || Body: ${loginResponse.body}`]: (r) => r.status === 200
        });
        if (`${__ENV.ENV}` != 'INT') {
            console.error(`VU${vuId} ${email} Login ERROR || Status: ${loginResponse.status} || Response: ${loginResponse.body}`);
        }
    }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/gamification/api/v2/user/detail`,
        ];

        const batchHeaders = {

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
            ['GET', urls[0], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Login.Gamification_User_Detail,
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