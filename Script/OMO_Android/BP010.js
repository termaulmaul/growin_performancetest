import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP010 - Profile Terms & Conditions Bottom Sheet

// Define custom metrics
const ProfileTermsConditionsBottomSheet = {
    Oaofinance_Margin_Tnc: {
        errorCount: new Counter("error_count_010_01_01_Oaofinance_Margin_Tnc"),
        errorRate: new Rate("error_rate_010_01_01_Oaofinance_Margin_Tnc"),
        httpDuration: new Trend("duration_010_01_01_Oaofinance_Margin_Tnc"),
        httpWaiting: new Trend("waiting_010_01_01_Oaofinance_Margin_Tnc"),
        requestRate: new Counter("rps_010_01_01_Oaofinance_Margin_Tnc"),
        http_reqs: new Counter("sample_010_01_01_Oaofinance_Margin_Tnc"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP010(data) {
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

    // 1 //
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/margin/tnc`,
        ];

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
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                ProfileTermsConditionsBottomSheet.Oaofinance_Margin_Tnc,
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