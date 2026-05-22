import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Data_Visualization
// /udf/api/v1/indicators?symbol=COMPOSITE&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXBASIC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXCYCLIC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXENERGY&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXFINANCE&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXHEALTH&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXINDUST&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXINFRA&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXNONCYC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXPROPERT&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXTECHNO&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXTRANS&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=BMRI&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=RG

// /marketdata/api/v1/stakeholders?type=STOCK&value=BMRI

// =====

// Udf_Indicators_COMPOSITE_D_IDX
// Udf_Indicators_IDXBASIC_D_IDX
// Udf_Indicators_IDXCYCLIC_D_IDX
// Udf_Indicators_IDXENERGY_D_IDX
// Udf_Indicators_IDXFINANCE_D_IDX
// Udf_Indicators_IDXHEALTH_D_IDX
// Udf_Indicators_IDXINDUST_D_IDX
// Udf_Indicators_IDXINFRA_D_IDX
// Udf_Indicators_IDXNONCYC_D_IDX
// Udf_Indicators_IDXPROPERT_D_IDX
// Udf_Indicators_IDXTECHNO_D_IDX
// Udf_Indicators_IDXTRANS_D_IDX
// Udf_Indicators_BMRI_D_RG

// Marketdata_Stakeholders_STOCK_BMRI

// Define custom metrics
const Trend_Rotation = {
    Udf_Indicators_COMPOSITE_D_IDX: {
        errorCount: new Counter("error_count_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
        errorRate: new Rate("error_rate_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
        httpDuration: new Trend("duration_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
        requestRate: new Counter("rps_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
        http_reqs: new Counter("sample_001_01_01_Udf_Indicators_COMPOSITE_D_IDX"),
    },
    Udf_Indicators_IDXBASIC_D_IDX: {
        errorCount: new Counter("error_count_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
        errorRate: new Rate("error_rate_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
        httpDuration: new Trend("duration_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
        requestRate: new Counter("rps_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
        http_reqs: new Counter("sample_001_01_02_Udf_Indicators_IDXBASIC_D_IDX"),
    },
    Udf_Indicators_IDXCYCLIC_D_IDX: {
        errorCount: new Counter("error_count_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
        errorRate: new Rate("error_rate_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
        httpDuration: new Trend("duration_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
        requestRate: new Counter("rps_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
        http_reqs: new Counter("sample_001_01_03_Udf_Indicators_IDXCYCLIC_D_IDX"),
    },
    Udf_Indicators_IDXENERGY_D_IDX: {
        errorCount: new Counter("error_count_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
        errorRate: new Rate("error_rate_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
        httpDuration: new Trend("duration_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
        requestRate: new Counter("rps_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
        http_reqs: new Counter("sample_001_01_04_Udf_Indicators_IDXENERGY_D_IDX"),
    },
    Udf_Indicators_IDXFINANCE_D_IDX: {
        errorCount: new Counter("error_count_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
        errorRate: new Rate("error_rate_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
        httpDuration: new Trend("duration_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
        requestRate: new Counter("rps_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
        http_reqs: new Counter("sample_001_01_05_Udf_Indicators_IDXFINANCE_D_IDX"),
    },
    Udf_Indicators_IDXHEALTH_D_IDX: {
        errorCount: new Counter("error_count_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
        errorRate: new Rate("error_rate_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
        httpDuration: new Trend("duration_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
        requestRate: new Counter("rps_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
        http_reqs: new Counter("sample_001_01_06_Udf_Indicators_IDXHEALTH_D_IDX"),
    },
    Udf_Indicators_IDXINDUST_D_IDX: {
        errorCount: new Counter("error_count_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
        errorRate: new Rate("error_rate_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
        httpDuration: new Trend("duration_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
        requestRate: new Counter("rps_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
        http_reqs: new Counter("sample_001_01_07_Udf_Indicators_IDXINDUST_D_IDX"),
    },
    Udf_Indicators_IDXINFRA_D_IDX: {
        errorCount: new Counter("error_count_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
        errorRate: new Rate("error_rate_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
        httpDuration: new Trend("duration_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
        requestRate: new Counter("rps_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
        http_reqs: new Counter("sample_001_01_08_Udf_Indicators_IDXINFRA_D_IDX"),
    },
    Udf_Indicators_IDXNONCYC_D_IDX: {
        errorCount: new Counter("error_count_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
        errorRate: new Rate("error_rate_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
        httpDuration: new Trend("duration_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
        requestRate: new Counter("rps_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
        http_reqs: new Counter("sample_001_01_09_Udf_Indicators_IDXNONCYC_D_IDX"),
    },
    Udf_Indicators_IDXPROPERT_D_IDX: {
        errorCount: new Counter("error_count_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
        errorRate: new Rate("error_rate_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
        httpDuration: new Trend("duration_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
        requestRate: new Counter("rps_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
        http_reqs: new Counter("sample_001_01_10_Udf_Indicators_IDXPROPERT_D_IDX"),
    },
    Udf_Indicators_IDXTECHNO_D_IDX: {
        errorCount: new Counter("error_count_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
        errorRate: new Rate("error_rate_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
        httpDuration: new Trend("duration_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
        requestRate: new Counter("rps_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
        http_reqs: new Counter("sample_001_01_11_Udf_Indicators_IDXTECHNO_D_IDX"),
    },
    Udf_Indicators_IDXTRANS_D_IDX: {
        errorCount: new Counter("error_count_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
        errorRate: new Rate("error_rate_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
        httpDuration: new Trend("duration_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
        requestRate: new Counter("rps_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
        http_reqs: new Counter("sample_001_01_12_Udf_Indicators_IDXTRANS_D_IDX"),
    },
    Udf_Indicators_BMRI_D_RG: {
        errorCount: new Counter("error_count_001_01_13_Udf_Indicators_BMRI_D_RG"),
        errorRate: new Rate("error_rate_001_01_13_Udf_Indicators_BMRI_D_RG"),
        httpDuration: new Trend("duration_001_01_13_Udf_Indicators_BMRI_D_RG"),
        httpWaiting: new Trend("waiting_001_01_13_Udf_Indicators_BMRI_D_RG"),
        requestRate: new Counter("rps_001_01_13_Udf_Indicators_BMRI_D_RG"),
        http_reqs: new Counter("sample_001_01_13_Udf_Indicators_BMRI_D_RG"),
    },
};
const Ownership_Mapping = {
    Marketdata_Stakeholders_STOCK_BMRI: {
        errorCount: new Counter("error_count_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
        errorRate: new Rate("error_rate_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
        httpDuration: new Trend("duration_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
        httpWaiting: new Trend("waiting_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
        requestRate: new Counter("rps_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
        http_reqs: new Counter("sample_001_02_01_Marketdata_Stakeholders_STOCK_BMRI"),
    },
}

export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    
    // ✅ Get mapping from setup
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        // console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
        return;
    }
    
    const userKey = mapping.userKey;
    
    // ✅ CRITICAL: Ambil token langsung dari setup - TIDAK perlu login ulang
    const userTokenData = data.tokens[userKey];
    
    if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
        return;
    }
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };

    const headersAfterLogin = {
        'Cookie': `ACCESS_TOKEN=${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'User-Agent': 'Growin/1.4.1 (iPhone; iOS 26.1) Alamofire/5.9.1',
        'X-App-Name': 'web',
        'X-App-Version': '1.4.1',
        'X-Device-Info': 'iPhone 11',
        'X-Device-Id': 'TEST3',
    };

    // ─── Batch 1 - Trend Rotation ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/udf/api/v1/indicators?symbol=COMPOSITE&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXBASIC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXCYCLIC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXENERGY&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXFINANCE&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXHEALTH&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXINDUST&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXINFRA&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXNONCYC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXPROPERT&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXTECHNO&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=IDXTRANS&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=BMRI&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=RG`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterLogin }],
            ['GET', urls[1], null, { headers: headersAfterLogin }],
            ['GET', urls[2], null, { headers: headersAfterLogin }],
            ['GET', urls[3], null, { headers: headersAfterLogin }],
            ['GET', urls[4], null, { headers: headersAfterLogin }],
            ['GET', urls[5], null, { headers: headersAfterLogin }],
            ['GET', urls[6], null, { headers: headersAfterLogin }],
            ['GET', urls[7], null, { headers: headersAfterLogin }],
            ['GET', urls[8], null, { headers: headersAfterLogin }],
            ['GET', urls[9], null, { headers: headersAfterLogin }],
            ['GET', urls[10], null, { headers: headersAfterLogin }],
            ['GET', urls[11], null, { headers: headersAfterLogin }],
            ['GET', urls[12], null, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Trend_Rotation.Udf_Indicators_COMPOSITE_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXBASIC_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXCYCLIC_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXENERGY_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXFINANCE_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXHEALTH_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXINDUST_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXINFRA_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXNONCYC_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXPROPERT_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXTECHNO_D_IDX,
                Trend_Rotation.Udf_Indicators_IDXTRANS_D_IDX,
                Trend_Rotation.Udf_Indicators_BMRI_D_RG
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

    // ─── Batch 2 - Ownership Mapping ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/marketdata/api/v1/stakeholders?type=STOCK&value=BMRI`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Ownership_Mapping.Marketdata_Stakeholders_STOCK_BMRI,
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