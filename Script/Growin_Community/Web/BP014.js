import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// /socialinvesting/api/v1/social/remove-by-admin?channel_id=${param.channel_id}

// Socialinvesting_Social_RemoveByAdmin

// Define custom metrics
const KickByAdmin = {
    Socialinvesting_Social_RemoveByAdmin: {
        errorCount: new Counter("error_count_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
        errorRate: new Rate("error_rate_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
        httpDuration: new Trend("duration_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
        httpWaiting: new Trend("waiting_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
        requestRate: new Counter("rps_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
        http_reqs: new Counter("sample_014_01_01_Socialinvesting_Social_RemoveByAdmin"),
    },
};

// ✅ EXPORTED FUNCTION - menggunakan channel_id dari setup
export function BP014(data) {
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
            base_url + `/socialinvesting/api/v1/social/remove-by-admin?channel_id=${channel_id}`,
        ];

        const Socialinvesting_Social_RemoveByAdmin_Payload = JSON.stringify({
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
            ['POST', urls[0], Socialinvesting_Social_RemoveByAdmin_Payload, { headers: stepOneHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                KickByAdmin.Socialinvesting_Social_RemoveByAdmin,
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