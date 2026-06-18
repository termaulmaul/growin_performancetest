import { getDefaultHeaders } from "../../../Helper/config.js";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /auth/api/v1/protected/account-center/switchables

// ===================================================

// GET_Auth_Protected_AccountCenter_Switchables

// Define custom metrics
const Auth_Protected_AccountCenter_Switchables = {
    Auth_Protected_AccountCenter_Switchables: {
        errorCount: new Counter("error_count_Auth_Protected_AccountCenter_Switchables"),
        errorRate: new Rate("error_rate_Auth_Protected_AccountCenter_Switchables"),
        httpDuration: new Trend("duration_Auth_Protected_AccountCenter_Switchables"),
        httpWaiting: new Trend("waiting_Auth_Protected_AccountCenter_Switchables"),
        requestRate: new Counter("rps_Auth_Protected_AccountCenter_Switchables"),
        http_reqs: new Counter("sample_Auth_Protected_AccountCenter_Switchables"),
    },
};

export function BP007(data) {
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
        const userTokenData = data.tokens[userKey];
        
        if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
            console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
            return;
        }
        
        const token = userTokenData.token;
        const pinToken = userTokenData.pin_token;
        const email = userTokenData.email;

    // ─── Batch 1 - Login_PIN ───────────────────────────────────────────────────
    const headersAfterPin = getDefaultHeaders(token, pinToken);

    // ─── Batch 2 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/auth/api/v1/protected/account-center/switchables`,
        ];

        const responses = [
        http.get(urls[0], { headers: headersAfterPin })
    ];

        responses.forEach((response, index) => {
            const metrics = [
                Auth_Protected_AccountCenter_Switchables.Auth_Protected_AccountCenter_Switchables
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