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
    
    if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
        return;
    }
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = getDefaultHeaders();

    const headersAfterLogin = getDefaultHeaders(token);

    const headersAfterPin = getDefaultHeaders(token, pinToken);

    // Batch 1 - Login_Password
    const urls = [
        base_url + `/auth/api/v1/protected/verified-device/list`,
    ];

    const Auth_AdminLogin_Payload = JSON.stringify({
        email: email,
        password: "M@nsek.123",
        recaptcha: '',
    });

    const responses = [
        http.post(urls[0], Auth_AdminLogin_Payload, { headers: headersBeforeLogin })
    ];

    responses.forEach((response, index) => {
        const metrics = [
            DeviceManagement.Auth_Protected_VerifiedDevice_List,
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
                [`ERROR ${urls[index]} || Status: ${response.status}`]: (r) => r.status === 200
            });
            
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response: ${response.body}`);
            }
        }
    });

    sleep(0.25);
}