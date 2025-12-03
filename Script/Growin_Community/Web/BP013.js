import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /socialinvesting/api/v1/social/request-kick-member?channel_id=1

// Socialinvesting_Social_RequestKickMember

// Define custom metrics
const AddKickRequestFromSuhuToAdmin = {
    Socialinvesting_Social_RequestKickMember: {
        errorCount: new Counter("error_count_013_01_01_Socialinvesting_Social_RequestKickMember"),
        errorRate: new Rate("error_rate_013_01_01_Socialinvesting_Social_RequestKickMember"),
        httpDuration: new Trend("duration_013_01_01_Socialinvesting_Social_RequestKickMember"),
        httpWaiting: new Trend("waiting_013_01_01_Socialinvesting_Social_RequestKickMember"),
        requestRate: new Counter("rps_013_01_01_Socialinvesting_Social_RequestKickMember"),
        http_reqs: new Counter("sample_013_01_01_Socialinvesting_Social_RequestKickMember"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP013(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token || !userToken.pin_token) {
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;

    // ✅ Ambil channel_id untuk BP ini dari data yang sudah di-fetch di setup()
    const channel_id = data.channelIds ? data.channelIds[bp] : null;
    
    if (!channel_id) {
        console.error(`❌ ${email} (${bp}) - No channel_id available, skipping iteration`);
        return;
    }

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/socialinvesting/api/v1/social/request-kick-member?channel_id=${channel_id}`,
        ];

        const Socialinvesting_Social_RequestKickMember_Payload = JSON.stringify({
            community_ids: [channel_id],
        });

        const stepOneHeaders = {
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
            ['POST', urls[0], Socialinvesting_Social_RequestKickMember_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                AddKickRequestFromSuhuToAdmin.Socialinvesting_Social_RequestKickMember,
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