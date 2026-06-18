import { getDefaultHeaders } from "../../../Helper/config.js";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// login password
// /auth/api/v2/admin-login

// ===================================================

// Login_Password
// Auth_AdminLogin

// Define custom metrics
const Login_Password = {
    Auth_AdminLogin: {
        errorCount: new Counter("error_count_Auth_AdminLogin"),
        errorRate: new Rate("error_rate_Auth_AdminLogin"),
        httpDuration: new Trend("duration_Auth_AdminLogin"),
        httpWaiting: new Trend("waiting_Auth_AdminLogin"),
        requestRate: new Counter("rps_Auth_AdminLogin"),
        http_reqs: new Counter("sample_Auth_AdminLogin"),
    },
};

export function BP001(data) {
    const vuId = exec.vu.idInTest;
        const base_url = data.base_url;
        const iterationId = exec.scenario.iterationInTest;
        const runTimestamp = Date.now();
        
        const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
        // const mapping = data.vuMapping[vuId];
        // if (!mapping) {
        //     return;
        
        const userKey = mapping.userKey;
        const userTokenData = data.tokens[userKey];
        
        // if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        //     return;
        
        // const token = userTokenData.token;
        // const pinToken = userTokenData.pin_token;
        const email = userTokenData.email;
    
        const headersAfterLogin = getDefaultHeaders(token);

    // ─── Batch 1 - Login_PIN ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/protected/admin-pin-login`,
        ];

        const Auth_Protected_AdminPinLogin_Payload = JSON.stringify({
            value: "123456"
        });

        const responses = [
        http.post(urls[0], Auth_Protected_AdminPinLogin_Payload, { headers: headersAfterLogin })
    ];

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

    const headersAfterPin = getDefaultHeaders(token, pinToken);

    // ─── Batch 2 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/admin/refresh/pass-token`,
        ];

        const responses = [
        http.get(urls[0], { headers: headersAfterPin })
    ];

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