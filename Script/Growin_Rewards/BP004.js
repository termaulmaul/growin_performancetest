import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

const TransactionHistory = {
    Gamification_Transaction_History: {
        errorCount: new Counter("error_count_004_01_01_Gamification_Transaction_History"),
        errorRate: new Rate("error_rate_004_01_01_Gamification_Transaction_History"),
        httpDuration: new Trend("duration_004_01_01_Gamification_Transaction_History"),
        httpWaiting: new Trend("waiting_004_01_01_Gamification_Transaction_History"),
        requestRate: new Counter("rps_004_01_01_Gamification_Transaction_History"),
        http_reqs: new Counter("sample_004_01_01_Gamification_Transaction_History"),
    },
    Gamification_Transaction_History_Date: {
        errorCount: new Counter("error_count_004_01_02_Gamification_Transaction_History_Date"),
        errorRate: new Rate("error_rate_004_01_02_Gamification_Transaction_History_Date"),
        httpDuration: new Trend("duration_004_01_02_Gamification_Transaction_History_Date"),
        httpWaiting: new Trend("waiting_004_01_02_Gamification_Transaction_History_Date"),
        requestRate: new Counter("rps_004_01_02_Gamification_Transaction_History_Date"),
        http_reqs: new Counter("sample_004_01_02_Gamification_Transaction_History_Date"),
    },
};

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ✅ EXPORTED FUNCTION - dengan proper VU mapping
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

    const currentDate = formatDate(new Date());

    // Batch 1
    if (token) {
        const urls = [
            base_url + `/gamification/api/v2/transaction/history`,
            base_url + `/gamification/api/v2/transaction/history/${currentDate}`,
        ];

        const batchHeaders = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'en',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cookie': `ACCESS_TOKEN=${token};`,
            'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
            'X-App-Name': 'web',
            'X-App-Version': '1.4.1',
            'X-Device-Info': 'iPhone 11',
            'X-Device-Id': 'TEST3'
        };

        const requests = [
            ['GET', urls[0], null, { headers: batchHeaders }],
            ['GET', urls[1], null, { headers: batchHeaders }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                TransactionHistory.Gamification_Transaction_History,
                TransactionHistory.Gamification_Transaction_History_Date,
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