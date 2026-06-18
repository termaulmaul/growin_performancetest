import { getDefaultHeaders } from "../../../Helper/config.js";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Home
// /auth/api/v1/login

// Auth_Login

// Define custom metrics (unchanged)
const Login = {
    Auth_Login: {
        errorCount: new Counter("error_count_Auth_Login"),
        errorRate: new Rate("error_rate_Auth_Login"),
        httpDuration: new Trend("duration_Auth_Login"),
        httpWaiting: new Trend("waiting_Auth_Login"),
        requestRate: new Counter("rps_Auth_Login"),
        http_reqs: new Counter("sample_Auth_Login"),
    },
};

export function BP002(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        return;
    }
    
    const userKey = mapping.userKey;
    const userTokenData = data.tokens[userKey];
    
    // if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
    //     return;
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = getDefaultHeaders();

    // Batch 1 - Home
    {
        const urls = [
            base_url + `/auth/api/v1/login`,
        ];

        const Auth_Login_Payload = JSON.stringify({
            email: email,
            password: "M@nsek.123",
            recaptcha: '',
        });

        const responses = [
        http.post(urls[0], Auth_Login_Payload, { headers: headersBeforeLogin })
    ];

        responses.forEach((response, index) => {
            const metrics = [
                Login.Auth_Login,
            ];

            const metric = metrics[index];
            metric.httpDuration.add(response.timings.duration);
            
            if (response.status === 200) {
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
                    [`ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`]: (r) => r.status === 200
                });
                
                if (`${__ENV.ENV}` != 'INT') {
                    console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
                }
            }
        });
    }

    sleep(0.25);
}