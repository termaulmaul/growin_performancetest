import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP008 - Profile Confirmation Page

// Define custom metrics
const VerificationSummaryPage = {
    Oaofinance_UserOpeningProgressSummary_Monitoring_Margin: {
        errorCount: new Counter("error_count_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        errorRate: new Rate("error_rate_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpDuration: new Trend("duration_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpWaiting: new Trend("waiting_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        requestRate: new Counter("rps_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        http_reqs: new Counter("sample_008_01_01_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
    },
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_008_01_02_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_008_01_02_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_008_01_02_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_008_01_02_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_008_01_02_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_008_01_02_Oaofinance_Quota_Status_Margin"),
    },
    Oaofinance_Margin_FinancingDetail: {
        errorCount: new Counter("error_count_008_01_03_Oaofinance_Margin_FinancingDetail"),
        errorRate: new Rate("error_rate_008_01_03_Oaofinance_Margin_FinancingDetail"),
        httpDuration: new Trend("duration_008_01_03_Oaofinance_Margin_FinancingDetail"),
        httpWaiting: new Trend("waiting_008_01_03_Oaofinance_Margin_FinancingDetail"),
        requestRate: new Counter("rps_008_01_03_Oaofinance_Margin_FinancingDetail"),
        http_reqs: new Counter("sample_008_01_03_Oaofinance_Margin_FinancingDetail"),
    },
};

// ✅ EXPORTED FUNCTION
export function BP008(data) {
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
    if (token) {
        const urls = [
            base_url + `/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,
            base_url + `/oaofinance/api/v1/quota/status/margin`,
            base_url + `/oaofinance/api/v1/margin/financing-detail?content_type=margin`,
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
            'User-Agent':'PostmanRuntime/7.43.0'
        };

        const requests = [
            ['GET', urls[0], undefined, {headers:stepOneHeaders}],
            ['GET', urls[1], null, {headers:stepOneHeaders}],
            ['GET', urls[2], null, {headers:stepOneHeaders}],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                VerificationSummaryPage.Oaofinance_UserOpeningProgressSummary_Monitoring_Margin,
                VerificationSummaryPage.Oaofinance_Quota_Status_Margin,
                VerificationSummaryPage.Oaofinance_Margin_FinancingDetail,
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