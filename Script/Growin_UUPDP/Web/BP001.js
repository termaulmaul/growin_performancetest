import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// GET /user/api/v2/profile/trading
// POST	/user/api/v1/consent/submit

// User_Profile_Trading
// User_Consent_Submit

// Define custom metrics
const Consent = {
    User_Profile_Trading: {
        errorCount: new Counter("error_count_001_01_02_User_Profile_Trading"),
        errorRate: new Rate("error_rate_001_01_01_User_Profile_Trading"),
        httpDuration: new Trend("duration_001_01_01_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_001_01_01_User_Profile_Trading"),
        requestRate: new Counter("rps_001_01_01_User_Profile_Trading"),
        http_reqs: new Counter("sample_001_01_01_User_Profile_Trading"),
    },
    User_Consent_Submit: {
        errorCount: new Counter("error_count_001_01_02_User_Consent_Submit"),
        errorRate: new Rate("error_rate_001_01_02_User_Consent_Submit"),
        httpDuration: new Trend("duration_001_01_02_User_Consent_Submit"),
        httpWaiting: new Trend("waiting_001_01_02_User_Consent_Submit"),
        requestRate: new Counter("rps_001_01_02_User_Consent_Submit"),
        http_reqs: new Counter("sample_001_01_02_User_Consent_Submit"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    const userToken = data.tokens[userKey];
    
    if (!userToken || !userToken.token) {
        //  || !userToken.pin_token
        console.error(`❌ VU${vuId} (User ${userKey}) - No valid token or pin_token available, skipping iteration`);
        return;
    }
    
    const token = userToken.token;
    const pin_token = userToken.pin_token;
    const email = userToken.email;
    const bp = mapping.bp;

    const headers = {
        'Cookie': `ACCESS_TOKEN=${token};`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3'
    };

    // // Batch 1
    // if (token) {
    //     const urls = [
    //         base_url + `/user/api/v2/profile/trading`,
    //     ];

    //     const requests = [
    //         ['GET', urls[0], null, { headers: headers }],
    //     ];
    //     const responses = http.batch(requests);

    //     responses.forEach((response, index) => {
    //         const metrics = [
    //             Consent.User_Profile_Trading,
    //         ];

    //         const metric = metrics[index];
    //         metric.httpDuration.add(response.timings.duration);
    //         if (response.status === 200) {
    //             metric.errorRate.add(false);
    //             metric.errorCount.add(0);
    //             metric.requestRate.add(true);
    //             metric.http_reqs.add(1);
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 console.log(`${email} ${urls[index]} || Status: ${response.status} || Body: ${response.body}`);
    //             }
    //         } else {
    //             metric.errorRate.add(true);
    //             metric.errorCount.add(1);
    //             metric.requestRate.add(false);
    //             metric.http_reqs.add(1);
    //             check(response, {
    //                 [`ERROR ${urls[index]} || Status: ${response.status} || Body: ${response.body}`]: (r) => r.status === 200
    //             });
    //             if (`${__ENV.ENV}` != 'INT') {
    //                 const requestBody = requests[index][2];
    //                 console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Response Body: ${response.body} || Request Body: ${requestBody}`);
    //             }
    //         }
    //     });
    // }

    // Batch 2
    if (token) {
        const urls = [
            base_url + `/user/api/v1/consent/submit`,
        ];
        
        const Marketdata_Gpt_RecommendationQuestion_Payload = JSON.stringify({
            is_consent_uu_pdp : true, 
            is_consent_marketing : false
        });

        const requests = [
            ['POST', urls[0], Marketdata_Gpt_RecommendationQuestion_Payload, { headers: headers }]
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Consent.User_Consent_Submit,
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