import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// ##READ ME
//BP002 - Landing Page

// Define custom metrics
const LandingPage = {
    Oaofinance_Margin_Eligibility: {
        errorCount: new Counter("error_count_002_01_01_Oaofinance_Margin_Eligibility"),
        errorRate: new Rate("error_rate_002_01_01_Oaofinance_Margin_Eligibility"),
        httpDuration: new Trend("duration_002_01_01_Oaofinance_Margin_Eligibility"),
        httpWaiting: new Trend("waiting_002_01_01_Oaofinance_Margin_Eligibility"),
        requestRate: new Counter("rps_002_01_01_Oaofinance_Margin_Eligibility"),
        http_reqs: new Counter("sample_002_01_01_Oaofinance_Margin_Eligibility"),
    },
    Oaofinance_Margin_MinTotalCollateralAssetsValue: {
        errorCount: new Counter("error_count_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        errorRate: new Rate("error_rate_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpDuration: new Trend("duration_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        httpWaiting: new Trend("waiting_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        requestRate: new Counter("rps_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
        http_reqs: new Counter("sample_002_01_02_Oaofinance_Margin_MinTotalCollateralAssetsValue"),
    },
    Oaofinance_Margin_Benefit: {
        errorCount: new Counter("error_count_002_01_03_Oaofinance_Margin_Benefit"),
        errorRate: new Rate("error_rate_002_01_03_Oaofinance_Margin_Benefit"),
        httpDuration: new Trend("duration_002_01_03_Oaofinance_Margin_Benefit"),
        httpWaiting: new Trend("waiting_002_01_03_Oaofinance_Margin_Benefit"),
        requestRate: new Counter("rps_002_01_03_Oaofinance_Margin_Benefit"),
        http_reqs: new Counter("sample_002_01_03_Oaofinance_Margin_Benefit"),
    },
    Oaofinance_Margin_LeverageFee: {
        errorCount: new Counter("error_count_002_01_04_Oaofinance_Margin_LeverageFee"),
        errorRate: new Rate("error_rate_002_01_04_Oaofinance_Margin_LeverageFee"),
        httpDuration: new Trend("duration_002_01_04_Oaofinance_Margin_LeverageFee"),
        httpWaiting: new Trend("waiting_002_01_04_Oaofinance_Margin_LeverageFee"),
        requestRate: new Counter("rps_002_01_04_Oaofinance_Margin_LeverageFee"),
        http_reqs: new Counter("sample_002_01_04_Oaofinance_Margin_LeverageFee"),
    },
    Oaofinance_Margin_FinancingDetail: {
        errorCount: new Counter("error_count_002_01_05_Oaofinance_Margin_FinancingDetail"),
        errorRate: new Rate("error_rate_002_01_05_Oaofinance_Margin_FinancingDetail"),
        httpDuration: new Trend("duration_002_01_05_Oaofinance_Margin_FinancingDetail"),
        httpWaiting: new Trend("waiting_002_01_05_Oaofinance_Margin_FinancingDetail"),
        requestRate: new Counter("rps_002_01_05_Oaofinance_Margin_FinancingDetail"),
        http_reqs: new Counter("sample_002_01_05_Oaofinance_Margin_FinancingDetail"),
    },
    User_Profile_Trading: {
        errorCount: new Counter("error_count_002_01_06_User_Profile_Trading"),
        errorRate: new Rate("error_rate_002_01_06_User_Profile_Trading"),
        httpDuration: new Trend("duration_002_01_06_User_Profile_Trading"),
        httpWaiting: new Trend("waiting_002_01_06_User_Profile_Trading"),
        requestRate: new Counter("rps_002_01_06_User_Profile_Trading"),
        http_reqs: new Counter("sample_002_01_06_User_Profile_Trading"),
    },
    Oaofinance_Quota_Status_Margin: {
        errorCount: new Counter("error_count_002_01_07_Oaofinance_Quota_Status_Margin"),
        errorRate: new Rate("error_rate_002_01_07_Oaofinance_Quota_Status_Margin"),
        httpDuration: new Trend("duration_002_01_07_Oaofinance_Quota_Status_Margin"),
        httpWaiting: new Trend("waiting_002_01_07_Oaofinance_Quota_Status_Margin"),
        requestRate: new Counter("rps_002_01_07_Oaofinance_Quota_Status_Margin"),
        http_reqs: new Counter("sample_002_01_07_Oaofinance_Quota_Status_Margin"),
    },
};

// ✅ EXPORTED FUNCTION - Menggunakan token dari setup
export function BP002(data) {
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
        ['GET', urls1[0], undefined, {headers:stepOneHeaders}],
    ];
    const responses1 = http.batch(requests1);

    responses1.forEach((response, index) => {
        const metric = LandingPage.Oaofinance_Margin_Eligibility;
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}`!='INT') {
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
        const metric = LandingPage.Oaofinance_Margin_MinTotalCollateralAssetsValue;
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}`!='INT') {
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
        base_url + `/oaofinance/api/v1/margin/benefit`,
        base_url + `/oaofinance/api/v1/margin/leverage-fee`,
        base_url + `/oaofinance/api/v1/margin/financing-detail?content_type=margin`,
        base_url + `/user/api/v2/profile/trading`,
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
        ['GET', urls3[1], null, { headers: stepThreeHeaders }],
        ['GET', urls3[2], null, { headers: stepThreeHeaders }],
        ['GET', urls3[3], null, { headers: stepThreeHeaders }],
        ['GET', urls3[4], null, { headers: stepThreeHeaders }],
    ];
    const responses3 = http.batch(requests3);

    responses3.forEach((response, index) => {
        const metrics = [
            LandingPage.Oaofinance_Margin_Benefit,
            LandingPage.Oaofinance_Margin_LeverageFee,
            LandingPage.Oaofinance_Margin_FinancingDetail,
            LandingPage.User_Profile_Trading,
            LandingPage.Oaofinance_Quota_Status_Margin,
        ];

        const metric = metrics[index];
        metric.httpDuration.add(response.timings.duration);
        if (response.status === 200) {
            metric.errorRate.add(false);
            metric.errorCount.add(0);
            metric.requestRate.add(true);
            metric.http_reqs.add(1);
            if (`${__ENV.ENV}`!='INT') {
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