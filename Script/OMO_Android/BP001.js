import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';
a
// Define custom metrics
const MorePage = {
    Oaofinance_Quota_Status_Margin_1: {
        errorCount: new Counter("error_count_001_01_01_Oaofinance_Quota_Status_Margin_1"),
        errorRate: new Rate("error_rate_001_01_01_Oaofinance_Quota_Status_Margin_1"),
        httpDuration: new Trend("duration_001_01_01_Oaofinance_Quota_Status_Margin_1"),
        httpWaiting: new Trend("waiting_001_01_01_Oaofinance_Quota_Status_Margin_1"),
        requestRate: new Counter("rps_001_01_01_Oaofinance_Quota_Status_Margin_1"),
        http_reqs: new Counter("sample_001_01_01_Oaofinance_Quota_Status_Margin_1"),
    },
    Oaofinance_Margin_Eligibility: {
        errorCount: new Counter("error_count_001_01_02_Oaofinance_Margin_Eligibility"),
        errorRate: new Rate("error_rate_001_01_02_Oaofinance_Margin_Eligibility"),
        httpDuration: new Trend("duration_001_01_02_Oaofinance_Margin_Eligibility"),
        httpWaiting: new Trend("waiting_001_01_02_Oaofinance_Margin_Eligibility"),
        requestRate: new Counter("rps_001_01_02_Oaofinance_Margin_Eligibility"),
        http_reqs: new Counter("sample_001_01_02_Oaofinance_Margin_Eligibility"),
    },
    Oaofinance_UserOpeningProgressSummary_Monitoring_Margin: {
        errorCount: new Counter("error_count_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        errorRate: new Rate("error_rate_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpDuration: new Trend("duration_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        httpWaiting: new Trend("waiting_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        requestRate: new Counter("rps_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
        http_reqs: new Counter("sample_001_02_03_Oaofinance_UserOpeningProgressSummary_Monitoring_Margin"),
    },
    Oaofinance_Quota_Status_Margin_2: {
        errorCount: new Counter("error_count_001_03_04_Oaofinance_Quota_Status_Margin_2"),
        errorRate: new Rate("error_rate_001_03_04_Oaofinance_Quota_Status_Margin_2"),
        httpDuration: new Trend("duration_001_03_04_Oaofinance_Quota_Status_Margin_2"),
        httpWaiting: new Trend("waiting_001_03_04_Oaofinance_Quota_Status_Margin_2"),
        requestRate: new Counter("rps_001_03_04_Oaofinance_Quota_Status_Margin_2"),
        http_reqs: new Counter("sample_001_03_04_Oaofinance_Quota_Status_Margin_2"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dari setup
export function BP001(data) {
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
    const urls1 = [
        base_url + `/oaofinance/api/v1/quota/status/margin`,
        base_url + `/oaofinance/api/v1/margin/eligibility`,
    ];

    const stepOneHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const requests1 = [
        ['GET', urls1[0], null, { headers: stepOneHeaders }],
        ['GET', urls1[1], null, { headers: stepOneHeaders }],
    ];
    const responses1 = http.batch(requests1);

    responses1.forEach((response, index) => {
        const metrics = [
            MorePage.Oaofinance_Quota_Status_Margin_1,
            MorePage.Oaofinance_Margin_Eligibility,
        ];

        const metric = metrics[index];
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${urls1[index]} || Status: ${response.status}`);
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestRate.add(false);
            metric.http_reqs.add(1);
            check(response, {
                [`ERROR ${urls1[index]} || Status: ${response.status}`]: (r) => r.status === 200
            });
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls1[index]} || Status: ${response.status}`);
            }
        }
    });

    // Batch 2
    const urls2 = [
        base_url + `/oaofinance/api/v1/user-opening-progress-summary/monitoring/margin`,
    ];

    const stepTwoHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const requests2 = [
        ['GET', urls2[0], null, { headers: stepTwoHeaders }],
    ];
    const responses2 = http.batch(requests2);

    responses2.forEach((response, index) => {
        const metric = MorePage.Oaofinance_UserOpeningProgressSummary_Monitoring_Margin;
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${urls2[index]} || Status: ${response.status}`);
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestRate.add(false);
            metric.http_reqs.add(1);
            check(response, {
                [`ERROR ${urls2[index]} || Status: ${response.status}`]: (r) => r.status === 200
            });
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls2[index]} || Status: ${response.status}`);
            }
        }
    });

    // Batch 3
    const urls3 = [
        base_url + `/oaofinance/api/v1/quota/status/margin`,
    ];

    const stepThreeHeaders = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language':'en',
        'Connection':'keep-alive',
        'Accept-Encoding':'gzip, deflate, br',
        'Accept':'*/*',
    };

    const requests3 = [
        ['GET', urls3[0], null, { headers: stepThreeHeaders }],
    ];
    const responses3 = http.batch(requests3);

    responses3.forEach((response, index) => {
        const metric = MorePage.Oaofinance_Quota_Status_Margin_2;
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}` != 'INT') {
                console.log(`${email} ${urls3[index]} || Status: ${response.status}`);
            }
        } else {
            metric.errorRate.add(true);
            metric.errorCount.add(1);
            metric.requestRate.add(false);
            metric.http_reqs.add(1);
            check(response, {
                [`ERROR ${urls3[index]} || Status: ${response.status}`]: (r) => r.status === 200
            });
            if (`${__ENV.ENV}` != 'INT') {
                console.error(`${email} ERROR ${urls3[index]} || Status: ${response.status}`);
            }
        }
    });
    
    sleep(0.25);
}