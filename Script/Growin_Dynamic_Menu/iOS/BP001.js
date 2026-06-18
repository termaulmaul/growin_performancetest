import { getDefaultHeaders } from "../../../Helper/config.js";
import { check, sleep } from "k6";
import { Trend, Counter, Rate } from "k6/metrics";
import http from "k6/http";
import exec from 'k6/execution';

// GET /user/api/v1/menu/master
// GET /user/api/v1/menu/template
// POST /user/api/v1/menu/template
// GET /user/api/v1/menu/template/:template_id
// GET /user/api/v1/menu/template/default
// PUT /user/api/v1/menu/template/:template_id
// DELETE /user/api/v1/menu/template/:template_id
// PUT /user/api/v1/menu/template/default/:template_id

// User_Menu_Master
// User_Menu_Template
// User_Menu_Template_New
// User_Menu_Template_ByTemplateId
// User_Menu_Template_Default
// User_Menu_Template_ByTemplateId_Update
// User_Menu_Template_ByTemplateId_Delete
// User_Menu_Template_Default_ByTemplateId

// Define custom metrics
const Menu_Template_Management = {
    User_Menu_Master: {
        errorCount: new Counter("error_count_User_Menu_Master"),
        errorRate: new Rate("error_rate_User_Menu_Master"),
        httpDuration: new Trend("duration_User_Menu_Master"),
        httpWaiting: new Trend("waiting_User_Menu_Master"),
        requestRate: new Counter("rps_User_Menu_Master"),
        http_reqs: new Counter("sample_User_Menu_Master"),
    },
    User_Menu_Template: {
        errorCount: new Counter("error_count_User_Menu_Template"),
        errorRate: new Rate("error_rate_User_Menu_Template"),
        httpDuration: new Trend("duration_User_Menu_Template"),
        httpWaiting: new Trend("waiting_User_Menu_Template"),
        requestRate: new Counter("rps_User_Menu_Template"),
        http_reqs: new Counter("sample_User_Menu_Template"),
    },
    User_Menu_Template_New: {
        errorCount: new Counter("error_count_User_Menu_Template_New"),
        errorRate: new Rate("error_rate_User_Menu_Template_New"),
        httpDuration: new Trend("duration_User_Menu_Template_New"),
        httpWaiting: new Trend("waiting_User_Menu_Template_New"),
        requestRate: new Counter("rps_User_Menu_Template_New"),
        http_reqs: new Counter("sample_User_Menu_Template_New"),
    },
    User_Menu_Template_ByTemplateId: {
        errorCount: new Counter("error_count_User_Menu_Template_ByTemplateId"),
        errorRate: new Rate("error_rate_User_Menu_Template_ByTemplateId"),
        httpDuration: new Trend("duration_User_Menu_Template_ByTemplateId"),
        httpWaiting: new Trend("waiting_User_Menu_Template_ByTemplateId"),
        requestRate: new Counter("rps_User_Menu_Template_ByTemplateId"),
        http_reqs: new Counter("sample_User_Menu_Template_ByTemplateId"),
    },
    User_Menu_Template_Default: {
        errorCount: new Counter("error_count_User_Menu_Template_Default"),
        errorRate: new Rate("error_rate_User_Menu_Template_Default"),
        httpDuration: new Trend("duration_User_Menu_Template_Default"),
        httpWaiting: new Trend("waiting_User_Menu_Template_Default"),
        requestRate: new Counter("rps_User_Menu_Template_Default"),
        http_reqs: new Counter("sample_User_Menu_Template_Default"),
    },
    User_Menu_Template_ByTemplateId_Update: {
        errorCount: new Counter("error_count_User_Menu_Template_ByTemplateId_Update"),
        errorRate: new Rate("error_rate_User_Menu_Template_ByTemplateId_Update"),
        httpDuration: new Trend("duration_User_Menu_Template_ByTemplateId_Update"),
        httpWaiting: new Trend("waiting_User_Menu_Template_ByTemplateId_Update"),
        requestRate: new Counter("rps_User_Menu_Template_ByTemplateId_Update"),
        http_reqs: new Counter("sample_User_Menu_Template_ByTemplateId_Update"),
    },
    User_Menu_Template_ByTemplateId_Delete: {
        errorCount: new Counter("error_count_User_Menu_Template_ByTemplateId_Delete"),
        errorRate: new Rate("error_rate_User_Menu_Template_ByTemplateId_Delete"),
        httpDuration: new Trend("duration_User_Menu_Template_ByTemplateId_Delete"),
        httpWaiting: new Trend("waiting_User_Menu_Template_ByTemplateId_Delete"),
        requestRate: new Counter("rps_User_Menu_Template_ByTemplateId_Delete"),
        http_reqs: new Counter("sample_User_Menu_Template_ByTemplateId_Delete"),
    },
    User_Menu_Template_Default_ByTemplateId: {
        errorCount: new Counter("error_count_User_Menu_Template_Default_ByTemplateId"),
        errorRate: new Rate("error_rate_User_Menu_Template_Default_ByTemplateId"),
        httpDuration: new Trend("duration_User_Menu_Template_Default_ByTemplateId"),
        httpWaiting: new Trend("waiting_User_Menu_Template_Default_ByTemplateId"),
        requestRate: new Counter("rps_User_Menu_Template_Default_ByTemplateId"),
        http_reqs: new Counter("sample_User_Menu_Template_Default_ByTemplateId"),
    },
};

export function BP001(data) {
    const vuId = exec.vu.idInTest;
    const base_url = data.base_url;
    const iterationId = exec.scenario.iterationInTest;
    const runTimestamp = Date.now();
    
    const deviceId = `TEST_${runTimestamp}_${vuId}_${iterationId}`;
    const mapping = data.vuMapping[vuId];
    if (!mapping) {
        console.error(`❌ VU${vuId} - No mapping found, skipping iteration`);
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
    
    const headersAfterPin = getDefaultHeaders(token, pinToken);

    // ─── Batch 2 - Refresh_Token_Pass ───────────────────────────────────────────────────
    {
        const urls = [
            base_url + `/user/api/v1/menu/master`,
            base_url + `/user/api/v1/menu/template`,
            base_url + `/user/api/v1/menu/template`,
            base_url + `/user/api/v1/menu/template/:template_id`,
            base_url + `/user/api/v1/menu/template/default`,
            base_url + `/user/api/v1/menu/template/:template_id`,
            base_url + `/user/api/v1/menu/template/:template_id`,
            base_url + `/user/api/v1/menu/template/default/:template_id`,
        ];

        const requests = [
            ['GET', urls[0], null, { headers: headersAfterPin }],
            ['GET', urls[1], null, { headers: headersAfterPin }],
            ['POST', urls[2], null, { headers: headersAfterPin }],
            ['GET', urls[3], null, { headers: headersAfterPin }],
            ['GET', urls[4], null, { headers: headersAfterPin }],
            ['PUT', urls[5], null, { headers: headersAfterPin }],
            ['DELETE', urls[6], null, { headers: headersAfterPin }],
            ['PUT', urls[7], null, { headers: headersAfterPin }],
        ];
        const responses = http.batch(requests);

        responses.forEach((response, index) => {
            const metrics = [
                Menu_Template_Management.User_Menu_Master,
                Menu_Template_Management.User_Menu_Template,
                Menu_Template_Management.User_Menu_Template_New,
                Menu_Template_Management.User_Menu_Template_ByTemplateId,
                Menu_Template_Management.User_Menu_Template_Default,
                Menu_Template_Management.User_Menu_Template_ByTemplateId_Update,
                Menu_Template_Management.User_Menu_Template_ByTemplateId_Delete,
                Menu_Template_Management.User_Menu_Template_Default_ByTemplateId,
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