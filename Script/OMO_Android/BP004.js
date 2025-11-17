import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP004 - Profile Confirmation Page

// Define custom metrics
const ProfileConfirmationPage = {
    User_Profile_Identity_Regular: {
        errorCount: new Counter("error_count_004_01_01_User_Profile_Identity_Regular"),
        errorRate: new Rate("error_rate_004_01_01_User_Profile_Identity_Regular"),
        httpDuration: new Trend("duration_004_01_01_User_Profile_Identity_Regular"),
        httpWaiting: new Trend("waiting_004_01_01_User_Profile_Identity_Regular"),
        requestRate: new Counter("rps_004_01_01_User_Profile_Identity_Regular"),
        http_reqs: new Counter("sample_004_01_01_User_Profile_Identity_Regular"),
    },
    Oaofinance_Margin_Draft: {
        errorCount: new Counter("error_count_004_01_02_Oaofinance_Margin_Draft"),
        errorRate: new Rate("error_rate_004_01_02_Oaofinance_Margin_Draft"),
        httpDuration: new Trend("duration_004_01_02_Oaofinance_Margin_Draft"),
        httpWaiting: new Trend("waiting_004_01_02_Oaofinance_Margin_Draft"),
        requestRate: new Counter("rps_004_01_02_Oaofinance_Margin_Draft"),
        http_reqs: new Counter("sample_004_01_02_Oaofinance_Margin_Draft"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dari setup
export function BP004(data) {
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
    
    const token = userToken.token;
    const email = userToken.email;

    // Batch 1
    const urls = [
        base_url + `/user/api/v1/profile/identity/regular`,
        base_url + `/oaofinance/api/v1/margin/draft`,
    ];

    const stepOneHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const OaofinanceMarginPayload = JSON.stringify({
        is_consent_margin: true, 
        is_consent_lpip: true
    });

    const requests = [
        ['GET', urls[0], undefined, {headers:stepOneHeaders}],
        ['POST', urls[1], OaofinanceMarginPayload, {headers:stepOneHeaders}],
    ];
    const responses = http.batch(requests);

    responses.forEach((response, index) => {
        const metrics = [
            ProfileConfirmationPage.User_Profile_Identity_Regular,
            ProfileConfirmationPage.Oaofinance_Margin_Draft,
        ];

        const metric = metrics[index];
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${urls[index]} || Status: ${response.status}`);
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
                const requestBody = requests[index][2];
                console.error(`${email} ERROR ${urls[index]} || Status: ${response.status} || Request Body: ${requestBody}`);
            }
        }
    });
    
    sleep(0.25);
}