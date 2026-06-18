import { getDefaultHeaders } from "../../../Helper/config.js";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// Data_Visualization
// /udf/api/v1/indicators?symbol=COMPOSITE,IDXBASIC,IDXCYCLIC,IDXENERGY,IDXFINANCE,IDXHEALTH,IDXINDUST,IDXINFRA,IDXNONCYC,IDXPROPERT,IDXTECHNO,IDXTRANS&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=IDXBASIC&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX
// /udf/api/v1/indicators?symbol=BMRI&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=RG

// /marketdata/api/v1/stakeholders?type=STOCK&value=BMRI

// =====

// Udf_Indicators_COMPOSITE_D_IDX
// Udf_Indicators_IDXTRANS_D_IDX
// Udf_Indicators_BMRI_D_RG

// Marketdata_Stakeholders_STOCK_BMRI

// Define custom metrics
const Trend_Rotation = {
    Udf_Indicators_COMPOSITE_D_IDX: {
        errorCount: new Counter("error_count_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
        errorRate: new Rate("error_rate_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
        httpDuration: new Trend("duration_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
        httpWaiting: new Trend("waiting_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
        requestRate: new Counter("rps_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
        http_reqs: new Counter("sample_001_01_001_Udf_Indicators_COMPOSITE_D_IDX"),
    },
    Udf_Indicators_BMRI_D_RG: {
        errorCount: new Counter("error_count_001_01_002_Udf_Indicators_BMRI_D_RG"),
        errorRate: new Rate("error_rate_001_01_002_Udf_Indicators_BMRI_D_RG"),
        httpDuration: new Trend("duration_001_01_002_Udf_Indicators_BMRI_D_RG"),
        httpWaiting: new Trend("waiting_001_01_002_Udf_Indicators_BMRI_D_RG"),
        requestRate: new Counter("rps_001_01_002_Udf_Indicators_BMRI_D_RG"),
        http_reqs: new Counter("sample_001_01_002_Udf_Indicators_BMRI_D_RG"),
    },
};
const Ownership_Mapping = {
    Marketdata_Stakeholders_STOCK_BMRI: {
        errorCount: new Counter("error_count_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
        errorRate: new Rate("error_rate_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
        httpDuration: new Trend("duration_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
        httpWaiting: new Trend("waiting_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
        requestRate: new Counter("rps_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
        http_reqs: new Counter("sample_001_02_001_Marketdata_Stakeholders_STOCK_BMRI"),
    },
}

export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        return;
    }
    
    const userKey = mapping.userKey;
    const userTokenData = data.tokens[userKey];
    
    if (!userTokenData || !userTokenData.token || !userTokenData.pin_token) {
        console.error(`❌ VU${vuId} (${userTokenData?.email}) - No valid tokens from setup, skipping iteration`);
        return;
    }
    
    const token = userTokenData.token;
    const pinToken = userTokenData.pin_token;
    const email = userTokenData.email;

    const headersBeforeLogin = getDefaultHeaders();

    const headersAfterLogin = getDefaultHeaders(token);

    // ─── Batch 1 - Trend Rotation ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/udf/api/v1/indicators?symbol=COMPOSITE,IDXBASIC,IDXCYCLIC,IDXENERGY,IDXFINANCE,IDXHEALTH,IDXINDUST,IDXINFRA,IDXNONCYC,IDXPROPERT,IDXTECHNO,IDXTRANS&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=IDX`,
            base_url + `/udf/api/v1/indicators?symbol=BMRI&start_time=2026-01-01T17:00:00.000%2B07:00&end_time=2026-05-01T16:59:59.000%2B07:00&resolution=D&board=RG`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterLogin }],
            ['GET', urls[1], null, { headers: headersAfterLogin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Trend_Rotation.Udf_Indicators_COMPOSITE_D_IDX,
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

    sleep(0.25);

    // ─── Batch 2 - Ownership Mapping ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/marketdata/api/v1/stakeholders?type=STOCK&value=BMRI`,
        ];

        const responses = [
        http.get(urls[0], { headers: headersAfterLogin })
    ];

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